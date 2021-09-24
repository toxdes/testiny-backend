let PORT: number,
  SALT_ROUNDS: number,
  JWT_SECRET: string,
  USER_FIELDS_ALLOWED_TO_EDIT: string[],
  ARTIFICIAL_DELAY_IN_MILLIS: number,
  DATABASE_URL: string,
  CUSTOM_RESPONSE_HEADERS: Record<string, string>;

// salt rounds for bcrypt
SALT_ROUNDS = 12;
// default port
PORT = Number(process.env.PORT) || 8000;

// editable fields in /editprofile route
USER_FIELDS_ALLOWED_TO_EDIT = ["name", "bio", "avatar"];

// postgresql connection string
DATABASE_URL = process.env.DATABASE_URL as string;
// production specific config
if (process.env.ENV === "production") {
  if (process.env.PORT) PORT = Number(process.env.PORT);
  JWT_SECRET = process.env.JWT_SECRET as string;
  ARTIFICIAL_DELAY_IN_MILLIS = 0;
  DATABASE_URL = process.env.PROD_DATABASE_URL as string;
} else {
  JWT_SECRET = "super_secret_nuclear_missile_launch_codes";
  ARTIFICIAL_DELAY_IN_MILLIS = 0;
}
// Extra Response Headers
CUSTOM_RESPONSE_HEADERS = {
  "Content-Type": "application/json",
};
export {
  PORT,
  SALT_ROUNDS,
  JWT_SECRET,
  USER_FIELDS_ALLOWED_TO_EDIT,
  ARTIFICIAL_DELAY_IN_MILLIS,
  DATABASE_URL,
  CUSTOM_RESPONSE_HEADERS,
};
