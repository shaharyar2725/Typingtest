import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

// Comma-separated list of origins permitted to call the API.
// Leave unset in local development to allow all origins.
// Example (Vercel): ALLOWED_ORIGINS=https://typeflow.vercel.app
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// General rate limit: 200 requests per IP per 15-minute window.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please try again later." },
});

// Tighter limit for auth endpoints: 20 attempts per IP per 15 minutes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts — please try again later." },
});

const app: Express = express();

// Trust the first proxy hop (required for accurate IP detection behind Vercel's edge).
app.set("trust proxy", 1);

// Security headers via helmet.
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
);

// Structured request logging.
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// CORS — allow the configured origin(s); fall back to all origins in development.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server).
      if (!origin) return callback(null, true);
      // No allowlist configured → development mode, permit everything.
      if (ALLOWED_ORIGINS.length === 0) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin "${origin}" is not permitted by CORS policy.`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply the general rate limiter to all routes.
app.use(generalLimiter);

// Tighter limiter on authentication endpoints.
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

app.use("/api", router);

export default app;
