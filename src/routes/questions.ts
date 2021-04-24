import { app, prisma } from "../server";
import { err } from "../server/helpers";
import { v4 as uuid } from "uuid";

app.get("/questions/:id", async (req, res) => {
  const target_question_id = req.params?.id;
  let question;
  // read only question
  try {
    question = await prisma.question.findUnique({
      where: {
        id: Number(target_question_id),
      },
    });
    if (!question) {
      res.send(err("Invalid question ID."));
      return;
    }
  } catch (e) {
    console.error(e);
    res.send(err("Internal server error, apologies."));
    return;
  }
  res.send(JSON.stringify(question));
});

app.post("/questions/create", async (req, res) => {
  const me = (req as any).me;
  const data = req.body.data;
  data.questionId = uuid();
  if (!me) {
    res.send(err("Invalid action, you are not logged in."));
    return;
  }
  try {
    let question = await prisma.question.create({
      ...data,
    });
    if (!question) throw new Error("Couldn't create a question.");
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
        author: true,
        tags: true,
      },
    });
    const allowedKeys = [
      "questionId",
      "questionType",
      "text",
      "questionVisibility",
      "license",
      "choices",
      "difficulty",
      "tags",
      "author",
    ];

    let filteredResult = result.map((rec) => {
      let o = {};
      Object.keys(rec).forEach((key) => {
        if (allowedKeys.indexOf(key) > -1) (o as any)[key] = (rec as any)[key];
      });
      return o;
    });
    res.send(JSON.stringify(filteredResult));
  } catch (e) {
    console.error(e);
    res.end(err("Invalid query. Apologize please."));
    return;
  }
});
