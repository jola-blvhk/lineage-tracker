"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const lineage_service_1 = require("../services/lineage.service");
exports.apiRouter = (0, express_1.Router)();
const enableLineageSchema = zod_1.z.object({
    ledger_id: zod_1.z.string().min(1),
    identity_id: zod_1.z.string().min(1),
    currency: zod_1.z.string().min(1),
    allocation_strategy: zod_1.z.enum(["FIFO", "LIFO", "PROPORTIONAL"]).optional(),
});
function firstParam(value) {
    if (!value) {
        return "";
    }
    return Array.isArray(value) ? value[0] : value;
}
exports.apiRouter.get("/lineage/balance/:balanceId", async (req, res) => {
    try {
        const installedAppId = req.auth?.installed_app_id;
        if (!installedAppId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const data = await (0, lineage_service_1.fetchBalanceLineage)(firstParam(req.params.balanceId), installedAppId);
        res.json(data);
    }
    catch (error) {
        const detail = error instanceof Error ? error.message : "Unknown error";
        if (detail.includes("does not have fund lineage tracking enabled")) {
            res.status(409).json({
                error: "Lineage not enabled for this balance",
                detail: "This balance does not have fund lineage tracking enabled. Enable lineage first, then retry tracking.",
            });
            return;
        }
        res.status(502).json({
            error: "Failed to fetch balance lineage",
            detail,
        });
    }
});
exports.apiRouter.get("/lineage/transaction/:transactionId", async (req, res) => {
    try {
        const installedAppId = req.auth?.installed_app_id;
        if (!installedAppId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const data = await (0, lineage_service_1.fetchTransactionLineage)(firstParam(req.params.transactionId), installedAppId);
        res.json(data);
    }
    catch (error) {
        res.status(502).json({
            error: "Failed to fetch transaction lineage",
            detail: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.apiRouter.post("/lineage/enable-balance", async (req, res) => {
    try {
        const installedAppId = req.auth?.installed_app_id;
        if (!installedAppId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const parsed = enableLineageSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid payload", detail: parsed.error.flatten() });
            return;
        }
        const data = await (0, lineage_service_1.enableLineageForBalance)(installedAppId, parsed.data);
        res.json(data);
    }
    catch (error) {
        res.status(502).json({
            error: "Failed to enable lineage",
            detail: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
