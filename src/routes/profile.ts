import { USER_FIELDS_ALLOWED_TO_EDIT } from "./../config/constants";
import { app, prisma } from "../server";
import { err, getValidFields } from "../server/helpers";

app.get("/users/:username", async (req, res) => {
  const target_username = req.params?.username;
  let user;
  const me = (req as any).me;
  // console.log("target username", target_username);

  try {
    user = await prisma.user.findFirst({
      where: {
        username: target_username,
      },
      include: {
        profile: true,
      },
    });
    if (!user) {
      res.send(err("No such user exists."));
      return;
    }
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
        emailVerified: user.emailVerified,
        name: user.profile?.name,
        bio: user.profile?.bio,
        avatar: user.profile?.avatar,
        ownProfile: false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        followingCount: user.followingCount,
        followersCount: user.followersCount,
        alreadyFollowing: false,
      })
    );
  } else {
    // check if user.username == me.username
    if (user?.username === me?.username) {
      // if yes, then the user is requesting his own profile page,
      // we may allow him to edit his profile
      res.send(
        JSON.stringify({
          username: me?.username,
          emailVerified: me?.emailVerified,
          name: user.profile?.name,
          bio: user.profile?.bio,
          avatar: user.profile?.avatar,
          ownProfile: true,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
          followingCount: user.followingCount,
          followersCount: user.followersCount,
          alreadyFollowing: false,
        })
      );
    } else {
      // else user is logged in, but is visiting someone else's profile
      let alreadyFollowing =
        (await prisma.following.count({
          where: {
            userIdA: me.id,
            userIdB: user.id,
          },
        })) > 0;
      res.send(
        JSON.stringify({
          username: user?.username,
          emailVerified: user?.emailVerified,
          name: user.profile?.name,
          bio: user.profile?.bio,
          ownProfile: false,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
          followingCount: user.followingCount,
          followersCount: user.followersCount,
          alreadyFollowing,
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
    let followingCount = await prisma.following.count({
      where: {
        userIdA: me.id,
      },
    });
    let followersCount = await prisma.following.count({
      where: {
        userIdB: me.id,
      },
    });
    res.send(
      JSON.stringify({
        username: me.username,
        emailVerified: me.emailVerified,
        name: myProfile?.name,
        bio: myProfile?.bio,
        ownProfile: true,
        createdAt: me.createdAt,
        updatedAt: me.updatedAt,
        followingCount,
        followersCount,
      })
    );
  } catch (e) {
    console.error(e);
    res.send(err("Internal server error, apologies."));
  }
});

app.post("/users/:username/follow", async (req, res) => {
  const me = (req as any).me;
  const username = req.params.username;
  let target;
  if (!me) {
    res.send(err("You are not logged in."));
    return;
  }
  try {
    // check if is already following
    target = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!target) {
      res.send(err("The user you're trying to follow does not exist."));
      return;
    }
    let alreadyExists = await prisma.following.findFirst({
      where: {
        userIdA: me.id,
        userIdB: target.id,
      },
    });
    if (alreadyExists) {
      // unfollow
      await prisma.following.delete({
        where: {
          id: alreadyExists.id,
        },
      });
      await prisma.user.update({
        where: {
          id: me.id,
        },
        data: {
          followingCount: me.followingCount - 1,
        },
      });
      await prisma.user.update({
        where: {
          id: target.id,
        },
        data: {
          followersCount: target.followersCount - 1,
        },
      });
      res.send(
        JSON.stringify({
          status: "success",
          message: `You stopped following @${target.username}`,
        })
      );
    } else {
      await prisma.following.create({
        data: {
          userIdA: me.id,
          userIdB: target.id,
        },
      });
      await prisma.user.update({
        where: {
          id: me.id,
        },
        data: {
          followingCount: me.followingCount + 1,
        },
      });
      await prisma.user.update({
        where: {
          id: target.id,
        },
        data: {
          followersCount: target.followersCount + 1,
        },
      });
      res.send(
        JSON.stringify({
          status: "success",
          message: `You started following @${target.username}`,
        })
      );
    }
  } catch (e) {
    console.error(e);
    res.send(err("Internal error, apologies."));
    return;
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
    let me = (req as any).me;
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
      "emailVerified",
      "uuid",
      "createdAt",
      "updatedAt",
      "followingCount",
      "followersCount",
      "alreadyFollowing",
    ];
    let filteredResult = await Promise.all(
      result.map(async (rec: any) => {
        let o: Record<string, string | number | boolean> = {};
        Object.keys(rec).forEach((key) => {
          if (allowedKeys.indexOf(key) > -1)
            (o as any)[key] = (rec as any)[key];
        });
        o.alreadyFollowing = me
          ? (await prisma.following.count({
              where: { userIdA: me.id, userIdB: rec.id },
            })) > 0
          : false;
        return o;
      })
    );
    res.send(JSON.stringify(filteredResult));
  } catch (e) {
    console.error(e);
    res.end(err("Invalid query. Apologize please."));
    return;
  }
});
