import { generateToken, isEmpty, err } from "../server/helpers";
import { app, prisma } from "../server";
import { okay } from "../server/helpers";

app.post("/login", async (req, res) => {
  okay(async () => {
    let bad = isEmpty("any", [req.body.username, req.body.password]);
    if (bad) {
      res.status(400).send(err("Unexpected input, please apologize."));
      return;
    }
    const user = await prisma.user.findFirst({
      where: {
        username: req.body.username,
        password: req.body.password,
      },
    });
    if (!user) {
      res.send(JSON.stringify({ error: "Username/password dont match" }));
      return;
    }
    res.send(
      JSON.stringify({
        error: false,
        token: generateToken(user.uuid),
        status: "login successful",
      })
    );
  });
});
