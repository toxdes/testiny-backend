import { app, prisma } from "../server";
import { err, fromNow, isUUID } from "../server/helpers";
import { v4 as uuid } from "uuid";
import { License, QuestionType, QuestionVisibility } from "@prisma/client";

app.get("/questions/:id", async (req, res) => {
  const target_question_id = req.params?.id;
  let question;
  let key = isUUID(target_question_id) ? "questionId" : "id";
  // read only question
  try {
    question = await prisma.question.findUnique({
      where: {
        [key]: key === "id" ? Number(target_question_id) : target_question_id,
      },
      include: {
        author: {
          select: {
            createdAt: true,
            updatedAt: true,
            username: true,
            profile: {
              select: {
                bio: true,
                avatar: true,
              },
            },
            email: true,
          },
        },
        tags: {
          select: {
            tagName: true,
          },
        },
      },
    });
    if (!question) {
      res.send(err("Invalid question ID."));
      return;
    }

    let resp = {
      ...question,
      createdAt: fromNow(question.createdAt),
      updatedAt: fromNow(question.updatedAt),
    };
    res.send(JSON.stringify(resp));
  } catch (e) {
    console.error(e);
    res.send(err("Internal server error, apologies."));
    return;
  }
});

app.post("/questions/create", async (req, res) => {
  const me = (req as any).me;
  if (!me) {
    res.send(err("Invalid action, you are not logged in."));
    return;
  }
  const rawData = req.body.data;
  let data: any = {};
  try {
    data.questionType = QuestionType[rawData.questionType as QuestionType];
    data.text = rawData.text;
    data.questionVisibility =
      QuestionVisibility[rawData.questionVisibility as QuestionVisibility];
    data.questionId = uuid();
    data.license = License[rawData.license as License];
    data.choices = rawData.choices;
    data.difficulty = rawData.difficulty;
    data.author = {
      connect: {
        id: me.id,
      },
    };
  } catch (e) {
    console.error(e);
    res.send(
      err("Bad request, you haven't provided correct values for some fields.")
    );
    return;
  }
  try {
    let question = await prisma.question.create({
      data,
    });
    if (!question) throw new Error("Couldn't create a question.");
    if (rawData.tags && rawData.tags.length > 0) {
      await Promise.all(
        rawData.tags.map(async (tag: string) => {
          return prisma.questionTags.create({
            data: {
              questionId: question.id,
              tagName: tag,
            },
          });
        })
      );
    }
    res.send(JSON.stringify(question));
  } catch (e) {
    console.error(e);
    res.send(err("Couldn't create question. Internal error, apologies."));
    return;
  }
});

// /questions?page=4&n=5 means give 5 records, 16 to 21 in this case, if they exist
app.get("/questions", async (req, res) => {
  try {
    let records = Number(req.query.n);
    if (!records) records = 20;
    let skipped = Number(req.query.page) * records;
    if (!skipped) skipped = 0;
    let result = await prisma.question.findMany({
      skip: skipped,
      take: records,
      include: {
        author: {
          select: {
            createdAt: true,
            updatedAt: true,
            username: true,
            profile: {
              select: {
                bio: true,
                avatar: true,
              },
            },
            email: true,
          },
        },
        tags: true,
      },
    });
    if (!result) {
      res.send(err("No questions yet."));
    }
    let resp = result.map((rec) => {
      return {
        ...rec,
        createdAt: fromNow(rec.createdAt),
        updatedAt: fromNow(rec.updatedAt),
      };
    });
    res.send(JSON.stringify(resp));
  } catch (e) {
    console.error(e);
    res.end(err("Invalid query. Apologize please."));
    return;
  }
});
