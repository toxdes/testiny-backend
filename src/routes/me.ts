import { app, prisma } from "../server";
import { err } from "../server/helpers";

app.get("/me", async (req, res) => {
  let userId = (req as any).userId;
  let user;
  if ((req as any)?.userId) {
    user = await prisma.user.findUnique({
      where: {
        uuid: userId,
      },
    });
  }
  if (!user) {
    res.send(err("You are probably not logged in."));
  } else {
    res.send(
      JSON.stringify({
        email: user.email,
        username: user.username,
        emailVerified: user.email_verified,
      })
    );
  }
});
