import path from "node:path";
import { config as loadEnv } from "dotenv";
import cors from "cors";
import express from "express";
import { authMiddleware } from "./middleware/auth";
import { apiRouter } from "./routes/api";
import { portalRouter } from "./routes/portal";
import { webhookRouter } from "./routes/webhook";

loadEnv({ path: path.resolve(__dirname, "../.env"), override: true });

const app = express();
const port = Number(process.env.PORT ?? "4000");
const allowedOrigins = [process.env.FRONTEND_URL, process.env.BLNK_CLOUD_ORIGIN].filter(
  (origin): origin is string => Boolean(origin),
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/blnk/hooks", webhookRouter);
app.use("/blnk/portal", portalRouter);
app.use("/api", authMiddleware, apiRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
