import { decrypt, encrypt } from "../lib/crypto";
import { prisma } from "../lib/prisma";

type InstallPayload = {
  installed_app_id: string;
  app_id: string;
  organization_id: string;
  instance_id: string;
  api_key: string;
  granted_permissions: string[];
};

type UninstallPayload = {
  installed_app_id: string;
  uninstalled_at?: string;
};

export async function hasProcessedIdempotencyKey(
  idempotencyKey: string,
): Promise<boolean> {
  const existing = await prisma.webhookEvent.findUnique({
    where: { idempotencyKey },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function recordIdempotencyKey(
  idempotencyKey: string,
  eventType: "install" | "uninstall",
): Promise<void> {
  await prisma.webhookEvent.create({
    data: {
      idempotencyKey,
      eventType,
    },
  });
}

export async function upsertInstallation(payload: InstallPayload): Promise<void> {
  const encryptedApiKey = encrypt(payload.api_key);

  await prisma.installation.upsert({
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

export async function uninstallInstallation(payload: UninstallPayload): Promise<void> {
  const existing = await prisma.installation.findUnique({
    where: { installedAppId: payload.installed_app_id },
    select: { id: true },
  });

  if (!existing) {
    return;
  }

  await prisma.installation.update({
    where: { installedAppId: payload.installed_app_id },
    data: {
      encryptedApiKey: "",
      uninstalledAt: payload.uninstalled_at ? new Date(payload.uninstalled_at) : new Date(),
    },
  });
}

export async function getActiveInstallationByInstalledAppId(
  installedAppId: string,
): Promise<Awaited<ReturnType<typeof prisma.installation.findFirst>>> {
  return prisma.installation.findFirst({
    where: {
      installedAppId,
      uninstalledAt: null,
      NOT: { encryptedApiKey: "" },
    },
  });
}

export async function getDecryptedApiKeyForInstallation(
  installedAppId: string,
): Promise<
  { apiKey: string; installation: NonNullable<Awaited<ReturnType<typeof getActiveInstallationByInstalledAppId>>> } | null
> {
  const installation = await getActiveInstallationByInstalledAppId(installedAppId);
  if (!installation) {
    return null;
  }

  const apiKey = decrypt(installation.encryptedApiKey);
  return { apiKey, installation };
}
