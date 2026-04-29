import { blnkGet, blnkPost } from "../lib/blnk";
import { getDecryptedApiKeyForInstallation } from "./install.service";

export type AuthorizedInstallationContext = {
  installedAppId: string;
  requiredScope?: string;
};

export type EnableLineageBalancePayload = {
  ledger_id: string;
  identity_id: string;
  currency: string;
  allocation_strategy?: "FIFO" | "LIFO" | "PROPORTIONAL";
};

async function getScopedCredentials({
  installedAppId,
  requiredScope = "data:read",
}: AuthorizedInstallationContext): Promise<{ apiKey: string; instanceId: string }> {
  const data = await getDecryptedApiKeyForInstallation(installedAppId);
  if (!data) {
    throw new Error("Installation not found or uninstalled");
  }

  if (!data.installation.grantedScopes.includes(requiredScope)) {
    throw new Error(`Missing required scope: ${requiredScope}`);
  }

  return { apiKey: data.apiKey, instanceId: data.installation.instanceId };
}

export async function fetchBalanceLineage(
  balanceId: string,
  installedAppId: string,
): Promise<unknown> {
  const { apiKey, instanceId } = await getScopedCredentials({ installedAppId });
  return blnkGet(`/balances/${balanceId}/lineage`, apiKey, instanceId);
}

export async function fetchTransactionLineage(
  transactionId: string,
  installedAppId: string,
): Promise<unknown> {
  const { apiKey, instanceId } = await getScopedCredentials({ installedAppId });
  return blnkGet(`/transactions/${transactionId}/lineage`, apiKey, instanceId);
}

export async function enableLineageForBalance(
  installedAppId: string,
  payload: EnableLineageBalancePayload,
): Promise<unknown> {
  const { apiKey, instanceId } = await getScopedCredentials({
    installedAppId,
    requiredScope: "data:write",
  });

  return blnkPost(
    "/balances",
    {
      ledger_id: payload.ledger_id,
      identity_id: payload.identity_id,
      currency: payload.currency,
      track_fund_lineage: true,
      allocation_strategy: payload.allocation_strategy ?? "FIFO",
    },
    apiKey,
    instanceId,
  );
}
