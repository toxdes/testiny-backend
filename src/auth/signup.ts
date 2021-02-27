import { generateToken } from "./helpers";
import { app, prisma, okay, err } from "../server";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../config/constants";
import { v4 as uuidv4 } from "uuid";
app.post("/signup", (req, res) => {
  okay(async () => {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const user = await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email,
          uuid: uuidv4(),
          password: hashedPassword,
        },
      });
      if (!user) {
        res.end(err("Server Error"));
        return;
      }
      res.end(
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
          .end(
            err(`${error.meta.target} not available/already exists.`, error)
          );
      } else {
        res.status(400).end(err("cannot create user. ", error));
      }
      return;
    }
  });
});
