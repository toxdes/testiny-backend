import { isEmail } from "./../server/helpers";
import bcrypt from "bcrypt";
import { generateToken, isEmpty, err } from "../server/helpers";
import { app, prisma } from "../server";
import { okay } from "../server/helpers";

app.post("/login", async (req, res) => {
  const username = req.body?.data?.username;
  const password = req.body?.data?.password;
  okay(async () => {
    let bad = isEmpty("any", [username, password]);
    if (bad) {
      console.log("something is empty.");
      res.send(err("Unexpected input, please apologize."));
      return;
    }
    let user;
    if (isEmail(username)) {
      user = await prisma.user.findUnique({
        where: {
          email: username,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: {
          username,
        },
      });
    }
    if (!user) {
      res.send(err("Username/password is wrong."));
      return;
    }
    const passwordOkay = await bcrypt.compare(
      req.body?.data?.password,
      user?.password
    );
    if (!passwordOkay) {
      res.send(err("Username/password is wrong."));
      return;
    }
    res.status(200).send(
      JSON.stringify({
        error: false,
        token: generateToken(user.uuid),
        status: "login successful",
      })
    );
  });
});
