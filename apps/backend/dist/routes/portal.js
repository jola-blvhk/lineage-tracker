"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const install_service_1 = require("../services/install.service");
const token_service_1 = require("../services/token.service");
const portalRequestSchema = zod_1.z.object({
    installed_app_id: zod_1.z.string(),
    app_id: zod_1.z.string(),
    organization_id: zod_1.z.string(),
    instance_id: zod_1.z.string(),
    user_id: zod_1.z.string(),
});
exports.portalRouter = (0, express_1.Router)();
exports.portalRouter.post("/", async (req, res) => {
    const parsed = portalRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
    }
    const body = parsed.data;
    const installation = await (0, install_service_1.getActiveInstallationByInstalledAppId)(body.installed_app_id);
    if (!installation) {
        res.status(404).json({ error: "Installation not found" });
        return;
    }
    const token = (0, token_service_1.issuePortalToken)({
        installed_app_id: body.installed_app_id,
        organization_id: body.organization_id,
        instance_id: body.instance_id,
        user_id: body.user_id,
    });
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
        res.status(500).json({ error: "FRONTEND_URL is not configured" });
        return;
    }
    const portalUrl = new URL("/embed", frontendUrl);
    portalUrl.searchParams.set("token", token);
    res.json({
        portal_url: portalUrl.toString(),
    });
});
