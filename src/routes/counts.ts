import { app, prisma } from "../server";
import { err } from "../server/helpers";

app.get("/count/:entity", async (req, res) => {
  try {
    const entity = req.params.entity;
    let cnt;

    if (entity === "users") {
      cnt = await prisma.user.count();
    } else if (entity === "questions") {
      cnt = await prisma.question.count();
    } else {
      throw new Error(`Counting ${entity} is not supported / allowed.`);
    }

    res.send({ status: "success", count: cnt });
  } catch (e: any) {
    res.send(err(e.message));
  }
});
