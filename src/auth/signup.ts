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
          req.body.username,
          req.body.email,
          req.body.password,
        ]) ||
        !validator.isEmail(req.body.email) ||
        !isUsername(req.body.username);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      if (bad) {
        res.status(400).send(err("Unexpected input, please apologize."));
        return;
      }
      const user = await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email,
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
    } catch (error) {
      if (error.code && error.code === "P2002") {
        res
          .status(400)
          .send(
            err(`${error.meta.target} not available/already exists.`, error)
          );
      } else {
        res.status(400).send(err("cannot create user. ", error));
      }
      return;
    }
  });
});
