import { app, prisma } from "../server";
import { okay } from "../server/helpers";

app.get("/", (req, res) => {
  okay(async () => {
    // await prisma.user.create({
    //     data:{
    //         username:'alice_wonderland',
    //         email:'alice_from_wonderland@prisma.io',
    //         password:'bruh',
    //         profile:{
    //             create:{name:'Alison Wonderland', bio:'I dont like turtles?'},
    //         },
    //     },
    // });
    let loggedIn = false;
    console.log();
    if ((req as any).userId) {
      // then we are logged in
      loggedIn = true;
    }
    const allUsers = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    res.setHeader("Content-Type", "application/json");
    res.send(
      JSON.stringify({
        loggedIn,
        users: loggedIn ? allUsers : "you are not logged in",
      })
    );
  });
});
