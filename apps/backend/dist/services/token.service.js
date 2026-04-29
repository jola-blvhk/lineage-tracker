"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issuePortalToken = issuePortalToken;
exports.verifyPortalToken = verifyPortalToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getSecret() {
    const secret = process.env.JWT_SECRET ?? "";
    if (!secret) {
        throw new Error("JWT_SECRET is required");
    }
    return secret;
}
function getTtlMinutes() {
    const ttl = Number(process.env.JWT_TTL_MINUTES ?? "30");
    return Number.isFinite(ttl) && ttl > 0 ? ttl : 30;
}
function issuePortalToken(claims) {
    const secret = getSecret();
    const ttlMinutes = getTtlMinutes();
    return jsonwebtoken_1.default.sign(claims, secret, {
        expiresIn: `${ttlMinutes}m`,
    });
}
function verifyPortalToken(token) {
    const secret = getSecret();
    return jsonwebtoken_1.default.verify(token, secret);
}
