"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const install_service_1 = require("../services/install.service");
const installPayloadSchema = zod_1.z.object({
    installed_app_id: zod_1.z.string(),
    app_id: zod_1.z.string(),
    organization_id: zod_1.z.string(),
    instance_id: zod_1.z.string(),
    api_key: zod_1.z.string(),
    granted_permissions: zod_1.z.array(zod_1.z.string()).default([]),
});
const uninstallPayloadSchema = zod_1.z.object({
    installed_app_id: zod_1.z.string(),
    app_id: zod_1.z.string().optional(),
    organization_id: zod_1.z.string().optional(),
    instance_id: zod_1.z.string().optional(),
    uninstalled_at: zod_1.z.string().optional(),
});
async function processInstall(idempotencyKey, payload) {
    if (await (0, install_service_1.hasProcessedIdempotencyKey)(idempotencyKey)) {
        return;
    }
    const data = installPayloadSchema.parse(payload);
    await (0, install_service_1.upsertInstallation)(data);
    await (0, install_service_1.recordIdempotencyKey)(idempotencyKey, "install");
}
async function processUninstall(idempotencyKey, payload) {
    if (await (0, install_service_1.hasProcessedIdempotencyKey)(idempotencyKey)) {
        return;
    }
    const data = uninstallPayloadSchema.parse(payload);
    await (0, install_service_1.uninstallInstallation)(data);
    await (0, install_service_1.recordIdempotencyKey)(idempotencyKey, "uninstall");
}
exports.webhookRouter = (0, express_1.Router)();
exports.webhookRouter.post("/", async (req, res) => {
    const idempotencyKey = req.header("Idempotency-Key") ?? "";
    if (!idempotencyKey.startsWith("install:") &&
        !idempotencyKey.startsWith("uninstall:")) {
        res.status(400).json({ error: "Invalid Idempotency-Key prefix" });
        return;
    }
    res.status(200).json({ ok: true });
    setImmediate(async () => {
        try {
            if (idempotencyKey.startsWith("install:")) {
                await processInstall(idempotencyKey, req.body);
            }
            else {
                await processUninstall(idempotencyKey, req.body);
            }
        }
        catch (error) {
            // Avoid failing webhook retries because response is already sent.
            console.error("Webhook post-response processing failed", error);
        }
    });
});
