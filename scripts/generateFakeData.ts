import faker from "faker";
import { prisma } from "../src/server";
import { SALT_ROUNDS } from "../src/config/constants";
import { genSalt, hashSync as hash } from "bcrypt";
import { License, QuestionVisibility, QuestionType } from "@prisma/client";
import { v4 as uuid } from "uuid";

// TODO optimize bulk inserts into PostgreSQL
// @body Currently, how transactions are committed inside prisma is a mystery to me. Prisma introduces `createMany` but it's not stable yet. Raw SQL queries can be used to speed up the insert operations, along with the methods mentioned [here](https://www.postgresql.org/docs/current/populate.html#POPULATE-COPY-FROM). Currently it takes around 20 seconds to generate 300 records.

// how many records to generate?
const USERS = 100;
const QUESTIONS = 200;

// get random element from an array
const getRandom = (arr: any[]) => {
  return arr[Math.floor(Math.random() * arr.length * 10) % arr.length];
};

// users
const generateUsers = async () => {
  return await Promise.all(
    Array.from({ length: USERS }).map(async (_) => {
      const salt = await genSalt(SALT_ROUNDS);
      let username = faker.internet.userName();
      let user = await prisma.user.create({
        data: {
          username: username,
          password: hash(username, salt),
          email: faker.internet.email(),
          emailVerified: getRandom([true, false]),
          uuid: uuid(),
        },
      });
      await prisma.userProfile.create({
        data: {
          name: faker.name.findName(),
          bio: faker.lorem.sentences(),
          avatar: faker.internet.avatar(),
          userId: user.id,
        },
      });
    })
  );
};

// questions
type UserType = {
  id: number;
};

const generateQuestions = async (users: UserType[]) => {
  return Promise.all(
    Array.from({ length: QUESTIONS }).map(async (_) => {
      const questionType = getRandom([
        QuestionType.NAT,
        QuestionType.MSQ,
        QuestionType.MCQ,
      ]);
      await prisma.question.create({
        data: {
          questionId: uuid(),
          text: faker.lorem.paragraphs(2),
          questionVisibility: getRandom([
            QuestionVisibility.PRIVATE,
            QuestionVisibility.PUBLIC,
            QuestionVisibility.PROTECTED,
          ]),
          license: getRandom([License.FREE, License.NON_FREE]),
          questionType: questionType,
          choices:
            questionType !== "NAT"
              ? Array.from({ length: 4 }).map((_) => faker.lorem.sentences(2))
              : [],
          difficulty: getRandom([100, 200, 500, 1000, 2000]),
          author: {
            connect: {
              id: getRandom(users).id,
            },
          },
          tags: {
            create: {
              tagName: getRandom(["easy", "medium", "hard"]),
            },
          },
        },
      });
    })
  );
};

const generate = async () => {
  console.log(" --- [Populating Database with dummy values] --- ");
  console.log(`Generating ${USERS} users, with their profiles...`);
  await generateUsers();
  console.log("Done!");
  console.log(`Generating ${QUESTIONS} questions...`);
  let users = await prisma.user.findMany({ select: { id: true } });
  await generateQuestions(users);
  console.log("Done!");
  prisma.$disconnect();
};

generate();
