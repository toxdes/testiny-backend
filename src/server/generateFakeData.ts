import faker from "faker";
import { prisma } from ".";
import { License, QuestionVisibility, QuestionType } from "@prisma/client";
import { v4 as uuid } from "uuid";
const USERS = 100;
const QUESTIONS = 200;

const getRandom = (arr: any[]) => {
  return arr[Math.floor(Math.random() * arr.length * 10) % arr.length];
};
// users
Array.from({ length: USERS }).map(async (_) => {
  let username = faker.internet.userName();
  const user = await prisma.user.create({
    data: {
      username: username,
      password: username,
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
});
// questions
prisma.user.findMany({ select: { id: true } }).then((users) => {
  console.log(users);
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
  });
});
