import { app, prisma } from "../server";
import { err, getValidFields } from "../server/helpers";

app.get("/questions", (req, res) => {
  res.status(200).end("Not Implemented yet!");
});

app.get("/questions/:id", (req, res) => {
  res.status(200).end("Not Implemented yet!");
});

app.post("/questions/create", (req, res) => {
  res.status(200).end("Not Implemented yet!");
});
