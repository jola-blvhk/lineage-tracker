"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const ALGO = "aes-256-gcm";
function getKey() {
    const keyHex = process.env.ENCRYPTION_KEY ?? "";
    const key = Buffer.from(keyHex, "hex");
    if (key.length !== 32) {
        throw new Error("ENCRYPTION_KEY must be a 32-byte hex string");
    }
    return key;
}
function encrypt(plaintext) {
    const key = getKey();
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}
function decrypt(stored) {
    const key = getKey();
    const [ivHex, tagHex, encHex] = stored.split(":");
    if (!ivHex || !tagHex || !encHex) {
        throw new Error("Invalid encrypted value format");
    }
    const decipher = crypto_1.default.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return (decipher.update(Buffer.from(encHex, "hex")).toString("utf8") +
        decipher.final("utf8"));
}
