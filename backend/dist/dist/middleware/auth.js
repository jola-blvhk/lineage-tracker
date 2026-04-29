"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const token_service_1 = require("../services/token.service");
function authMiddleware(req, res, next) {
    const header = req.header("Authorization");
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing bearer token" });
        return;
    }
    const token = header.slice("Bearer ".length);
    try {
        const claims = (0, token_service_1.verifyPortalToken)(token);
        req.auth = {
            installed_app_id: claims.installed_app_id,
            organization_id: claims.organization_id,
            instance_id: claims.instance_id,
            user_id: claims.user_id,
        };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
}
