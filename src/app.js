const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const tokenRoute = require("./routes/token");
const userInfoRoute = require("./routes/userInfo");
const env = require("./config/env");

const app = express();

/*
  ===== SECURITY =====
*/
app.use(helmet());

/*
  ===== TRUST PROXY =====
  Required if deployed behind:
  - Nginx
  - Cloudflare
  - Render
  - Railway
*/
app.set("trust proxy", 1);

/*
  ===== RATE LIMIT =====
*/
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/*
  ===== CORS =====
  Adjust allowed origins in production
*/
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/*
  ===== BODY PARSING =====
*/
app.use(express.json({ limit: "1mb" }));

/*
  ===== PERFORMANCE =====
*/
app.use(compression());

/*
  ===== LOGGING =====
*/
if (env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

/*
  ===== ROUTES =====
*/
app.use("/token", tokenRoute);
app.use("/userInfo", userInfoRoute);

/*
  ===== HEALTH CHECK =====
*/
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/*
  ===== GLOBAL ERROR HANDLER =====
*/
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error",
  });
});

module.exports = app;
