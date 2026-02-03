const { cleanEnv, str, port, url } = require("envalid");

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),

  PORT: port({ default: 4000 }),

  FAYDA_UPSTREAM_BASE: url(),
});

module.exports = env;
