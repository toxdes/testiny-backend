import { generateToken, isEmpty, isUsername } from "../server/helpers";
import { app, prisma } from "../server";
import { okay, err } from "../server/helpers";
import bcrypt from "bcrypt";
import validator from "validator";
import { SALT_ROUNDS } from "../config/constants";
import { v4 as uuidv4 } from "uuid";

app.post("/signup", (req, res) => {
  okay(async () => {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      let bad =
        isEmpty("any", [
          req.body?.data?.username,
          req.body?.data?.email,
          req.body?.data?.password,
        ]) ||
        !validator.isEmail(req.body?.data?.email) ||
        !isUsername(req.body?.data?.username);
      const hashedPassword = await bcrypt.hash(req.body?.data?.password, salt);
      if (bad) {
        res.send(err("Unexpected input, please apologize."));
        return;
      }
      const user = await prisma.user.create({
        data: {
          username: req.body?.data?.username,
          email: req.body?.data?.email,
          uuid: uuidv4(),
          password: hashedPassword,
        },
      });
      if (!user) {
        res.send(err("Server Error"));
        return;
      }
      res.send(
        JSON.stringify({
          error: false,
          message: "User created successfully!",
          token: generateToken(user.uuid),
        })
      );
    } catch (error: any) {
      console.error(error);
      if (error.code && error.code === "P2002") {
        res.send(
          err(`${error.meta.target} not available/already exists.`, error)
        );
      } else {
        res.send(err("cannot create user. ", error));
      }
      return;
    }
  });
});
