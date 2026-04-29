"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasProcessedIdempotencyKey = hasProcessedIdempotencyKey;
exports.recordIdempotencyKey = recordIdempotencyKey;
exports.upsertInstallation = upsertInstallation;
exports.uninstallInstallation = uninstallInstallation;
exports.getActiveInstallationByInstalledAppId = getActiveInstallationByInstalledAppId;
exports.getDecryptedApiKeyForInstallation = getDecryptedApiKeyForInstallation;
const crypto_1 = require("../lib/crypto");
const prisma_1 = require("../lib/prisma");
async function hasProcessedIdempotencyKey(idempotencyKey) {
    const existing = await prisma_1.prisma.webhookEvent.findUnique({
        where: { idempotencyKey },
        select: { id: true },
    });
    return Boolean(existing);
}
async function recordIdempotencyKey(idempotencyKey, eventType) {
    await prisma_1.prisma.webhookEvent.create({
        data: {
            idempotencyKey,
            eventType,
        },
    });
}
async function upsertInstallation(payload) {
    const encryptedApiKey = (0, crypto_1.encrypt)(payload.api_key);
    await prisma_1.prisma.installation.upsert({
        where: { installedAppId: payload.installed_app_id },
        create: {
            installedAppId: payload.installed_app_id,
            appId: payload.app_id,
            organizationId: payload.organization_id,
            instanceId: payload.instance_id,
            encryptedApiKey,
            grantedScopes: payload.granted_permissions,
        },
        update: {
            appId: payload.app_id,
            organizationId: payload.organization_id,
            instanceId: payload.instance_id,
            encryptedApiKey,
            grantedScopes: payload.granted_permissions,
            uninstalledAt: null,
        },
    });
}
async function uninstallInstallation(payload) {
    const existing = await prisma_1.prisma.installation.findUnique({
        where: { installedAppId: payload.installed_app_id },
        select: { id: true },
    });
    if (!existing) {
        return;
    }
    await prisma_1.prisma.installation.update({
        where: { installedAppId: payload.installed_app_id },
        data: {
            encryptedApiKey: "",
            uninstalledAt: payload.uninstalled_at ? new Date(payload.uninstalled_at) : new Date(),
        },
    });
}
async function getActiveInstallationByInstalledAppId(installedAppId) {
    return prisma_1.prisma.installation.findFirst({
        where: {
            installedAppId,
            uninstalledAt: null,
            NOT: { encryptedApiKey: "" },
        },
    });
}
async function getDecryptedApiKeyForInstallation(installedAppId) {
    const installation = await getActiveInstallationByInstalledAppId(installedAppId);
    if (!installation) {
        return null;
    }
    const apiKey = (0, crypto_1.decrypt)(installation.encryptedApiKey);
    return { apiKey, installation };
}
