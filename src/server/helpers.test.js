const wow = (name) => {
  if (!name) return "Hello, world!";
  return `Hello, ${name}!`;
};

describe("Hello world", () => {
  test("no argument, Hello world!", () => {
    expect(wow()).toBe("Hello, world!");
  });
  test("with argument", () => {
    expect(wow("bruh")).toBe("Hello, bruh!");
  });
});

describe("Hello world 2", () => {
  test("no argument, Hello world!", () => {
    expect(wow()).toBe("Hello, world!");
  });
  test("with argument", () => {
    expect(wow("bruh")).toBe("Hello, bruh!");
  });
});

describe("Hello world 3", () => {
  test("no argument, Hello world!", () => {
    expect(wow()).toBe("Hello, world!");
  });
  test("with argument", () => {
    expect(wow("bruh")).toBe("Hello, bruh!");
  });
});
