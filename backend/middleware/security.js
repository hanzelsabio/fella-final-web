import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:4173"];

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
const uploadLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30 });

export const setupSecurity = (app) => {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }, // ✅ allows images to load cross-origin
    }),
  );
  app.use(
    cors({
      origin: (origin, cb) =>
        !origin || ALLOWED_ORIGINS.includes(origin)
          ? cb(null, true)
          : cb(new Error("CORS blocked")),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/api/", apiLimiter);
  app.use("/api/auth/", authLimiter);
  app.use("/api/upload/", uploadLimiter);
  app.disable("x-powered-by");
  console.log("✅ Security middleware loaded");
};
