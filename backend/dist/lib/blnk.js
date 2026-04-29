"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blnkGet = blnkGet;
exports.blnkPost = blnkPost;
const axios_1 = __importDefault(require("axios"));
const defaultBaseURL = "https://core.blnkfinance.com";
function withInstanceId(path, instanceId) {
    const url = new URL(path, "http://localhost");
    url.searchParams.set("instance_id", instanceId);
    return `${url.pathname}${url.search}`;
}
async function blnkGet(path, apiKey, instanceId) {
    const requestPath = withInstanceId(path, instanceId);
    const baseURL = process.env.BLNK_CORE_BASE_URL ?? defaultBaseURL;
    try {
        const response = await axios_1.default.get(requestPath, {
            baseURL,
            timeout: 9000,
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            const status = error.response?.status;
            const responseData = typeof error.response?.data === "string"
                ? error.response.data
                : JSON.stringify(error.response?.data ?? {});
            throw new Error(`Core request failed: GET ${baseURL}${requestPath} -> ${status ?? "no-status"} ${responseData}`);
        }
        throw error;
    }
}
async function blnkPost(path, payload, apiKey, instanceId) {
    const requestPath = withInstanceId(path, instanceId);
    const baseURL = process.env.BLNK_CORE_BASE_URL ?? defaultBaseURL;
    try {
        const response = await axios_1.default.post(requestPath, payload, {
            baseURL,
            timeout: 9000,
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            const status = error.response?.status;
            const responseData = typeof error.response?.data === "string"
                ? error.response.data
                : JSON.stringify(error.response?.data ?? {});
            throw new Error(`Core request failed: POST ${baseURL}${requestPath} -> ${status ?? "no-status"} ${responseData}`);
        }
        throw error;
    }
}
