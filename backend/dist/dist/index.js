"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("./middleware/auth");
const api_1 = require("./routes/api");
const portal_1 = require("./routes/portal");
const webhook_1 = require("./routes/webhook");
(0, dotenv_1.config)({ path: node_path_1.default.resolve(__dirname, "../.env"), override: true });
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? "4000");
const allowedOrigins = [process.env.FRONTEND_URL, process.env.BLNK_CLOUD_ORIGIN].filter((origin) => Boolean(origin));
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: false,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/blnk/hooks", webhook_1.webhookRouter);
app.use("/blnk/portal", portal_1.portalRouter);
app.use("/api", auth_1.authMiddleware, api_1.apiRouter);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
