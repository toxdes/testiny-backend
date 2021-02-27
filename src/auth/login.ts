import { generateToken } from "./helpers";
import { app, prisma, okay } from "../server";

app.post("/login", async (req, res) => {
  console.log(req.body);
  okay(async () => {
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
