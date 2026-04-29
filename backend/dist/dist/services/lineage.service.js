"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBalanceLineage = fetchBalanceLineage;
exports.fetchTransactionLineage = fetchTransactionLineage;
exports.enableLineageForBalance = enableLineageForBalance;
const blnk_1 = require("../lib/blnk");
const install_service_1 = require("./install.service");
async function getScopedCredentials({ installedAppId, requiredScope = "data:read", }) {
    const data = await (0, install_service_1.getDecryptedApiKeyForInstallation)(installedAppId);
    if (!data) {
        throw new Error("Installation not found or uninstalled");
    }
    if (!data.installation.grantedScopes.includes(requiredScope)) {
        throw new Error(`Missing required scope: ${requiredScope}`);
    }
    return { apiKey: data.apiKey, instanceId: data.installation.instanceId };
}
async function fetchBalanceLineage(balanceId, installedAppId) {
    const { apiKey, instanceId } = await getScopedCredentials({ installedAppId });
    return (0, blnk_1.blnkGet)(`/balances/${balanceId}/lineage`, apiKey, instanceId);
}
async function fetchTransactionLineage(transactionId, installedAppId) {
    const { apiKey, instanceId } = await getScopedCredentials({ installedAppId });
    return (0, blnk_1.blnkGet)(`/transactions/${transactionId}/lineage`, apiKey, instanceId);
}
async function enableLineageForBalance(installedAppId, payload) {
    const { apiKey, instanceId } = await getScopedCredentials({
        installedAppId,
        requiredScope: "data:write",
    });
    return (0, blnk_1.blnkPost)("/balances", {
        ledger_id: payload.ledger_id,
        identity_id: payload.identity_id,
        currency: payload.currency,
        track_fund_lineage: true,
        allocation_strategy: payload.allocation_strategy ?? "FIFO",
    }, apiKey, instanceId);
}
