import { USER_FIELDS_ALLOWED_TO_EDIT } from "./../config/constants";
import { app, prisma } from "../server";
import { err, getValidFields } from "../server/helpers";

app.get("/profile/:username", async (req, res) => {
  const target_username = req.params?.username;
  let user, userProfile, myProfile;
  const me = (req as any).me;
  // console.log("target username", target_username);

  try {
    user = await prisma.user.findFirst({
      where: {
        username: target_username,
      },
    });
    if (!user) {
      res.send(err("No such user exists."));
      return;
    }
    userProfile = await prisma.userProfile.findUnique({
      where: {
        userId: user?.id,
      },
    });
  } catch (e) {
    console.error(e);
    res.send(err("Internal server error, apologies."));
    return;
  }
  if (!me) {
    // read only profile, public
    res.send(
      JSON.stringify({
        username: user.username,
        email_verified: user.email_verified,
        name: userProfile?.name,
        bio: userProfile?.bio,
        ownProfile: false,
      })
    );
  } else {
    // check if user.username == me.username
    if (user?.username === me?.username) {
      // if yes, then the user is requesting his own profile page,
      // we may allow him to edit his profile
      myProfile = await prisma.userProfile.findUnique({
        where: {
          userId: me?.id,
        },
      });
      res.send(
        JSON.stringify({
          username: me?.username,
          email_verified: me?.email_verified,
          name: myProfile?.name,
          bio: myProfile?.bio,
          ownProfile: true,
        })
      );
    } else {
      // else user is logged in, but is visiting someone else's profile
      res.send(
        JSON.stringify({
          username: user?.username,
          email_verified: user?.email_verified,
          name: userProfile?.name,
          bio: userProfile?.bio,
          ownProfile: false,
        })
      );
    }
  }
});

app.get("/me", async (req, res) => {
  // get user details from the token generated.
  const me = (req as any).me;
  if (!me) {
    res.send(err("Maybe the token is corrupted, cannot authorize."));
    return;
  }
  console.log("me", me);
  try {
    let myProfile = await prisma.userProfile.findUnique({
      where: {
        userId: me.id,
      },
    });
    res.send(
      JSON.stringify({
        username: me.username,
        email_verified: me.email_verified,
        name: myProfile?.name,
        bio: myProfile?.bio,
        ownProfile: true,
      })
    );
  } catch (e) {
    console.error(e);
    res.send(err("Internal server error, apologies."));
  }
});

app.post("/users/:username/edit", async (req, res) => {
  const me = (req as any).me;
  const username = req.params.username;
  let target;
  if (!me) {
    res.send(err("Invalid action, you are not logged in."));
    return;
  }
  try {
    target = await prisma.user.findUnique({
      where: {
        username,
      },
    });
  } catch (e) {
    console.error(e);
    res.send(err("Internal error, apologies."));
    return;
  }
  if (!target) {
    res.send(err("Username does not exist. Please Apologize."));
    return;
  }
  // TODO: Introduce privilige based permissions control for users
  // @body Currently, only user himself can edit his profile. However, if access control is introduced, then we might have account types as user, administrator, moderator, etc.
  if (me.username !== username) {
    res.send(err("You don't have permissions to edit someone else's profile"));
    return;
  }
  const data = getValidFields(USER_FIELDS_ALLOWED_TO_EDIT, req.body.data);
  try {
    console.log(me);

    await prisma.userProfile.upsert({
      create: {
        ...data,
        userId: me?.id,
      },
      update: {
        ...data,
      },
      where: {
        userId: me?.id,
      },
    });
    res.send(
      JSON.stringify({
        status: "success",
        message: "Profile updated successfully.",
      })
    );
  } catch (e) {
    console.error(e);
    res.send(err("Cannot update profile, Internal Error."));
  }
});

// /users?page=4&n=5 means give 5 records, 16 to 21 in this case, if they exist
app.get("/users", async (req, res) => {
  try {
    let records = Number(req.query.n);
    if (!records) records = 20;
    let skipped = Number(req.query.page) * records;
    if (!skipped) skipped = 0;
    let result = await prisma.user.findMany({
      skip: skipped,
      take: records,
      include: {
        profile: true,
      },
    });
    const allowedKeys = [
      "username",
      "profile",
      "email",
      "email_verified",
      "uuid",
    ];
    let filteredResult = result.map((rec) => {
      let o = {};
      Object.keys(rec).forEach((key) => {
        if (allowedKeys.indexOf(key) > -1) (o as any)[key] = (rec as any)[key];
      });
      return o;
    });
    res.send(JSON.stringify(filteredResult));
  } catch (e) {
    console.error(e);
    res.end(err("Invalid query. Apologize please."));
    return;
  }
});
