import { Router } from "express";
import { z } from "zod";
import {
  hasProcessedIdempotencyKey,
  recordIdempotencyKey,
  uninstallInstallation,
  upsertInstallation,
} from "../services/install.service";

const installPayloadSchema = z.object({
  installed_app_id: z.string(),
  app_id: z.string(),
  organization_id: z.string(),
  instance_id: z.string(),
  api_key: z.string(),
  granted_permissions: z.array(z.string()).default([]),
});

const uninstallPayloadSchema = z.object({
  installed_app_id: z.string(),
  app_id: z.string().optional(),
  organization_id: z.string().optional(),
  instance_id: z.string().optional(),
  uninstalled_at: z.string().optional(),
});

async function processInstall(idempotencyKey: string, payload: unknown): Promise<void> {
  if (await hasProcessedIdempotencyKey(idempotencyKey)) {
    return;
  }

  const data = installPayloadSchema.parse(payload);
  await upsertInstallation(data);
  await recordIdempotencyKey(idempotencyKey, "install");
}

async function processUninstall(
  idempotencyKey: string,
  payload: unknown,
): Promise<void> {
  if (await hasProcessedIdempotencyKey(idempotencyKey)) {
    return;
  }

  const data = uninstallPayloadSchema.parse(payload);
  await uninstallInstallation(data);
  await recordIdempotencyKey(idempotencyKey, "uninstall");
}

export const webhookRouter = Router();

webhookRouter.post("/", async (req, res) => {
  const idempotencyKey = req.header("Idempotency-Key") ?? "";

  if (
    !idempotencyKey.startsWith("install:") &&
    !idempotencyKey.startsWith("uninstall:")
  ) {
    res.status(400).json({ error: "Invalid Idempotency-Key prefix" });
    return;
  }

  res.status(200).json({ ok: true });

  setImmediate(async () => {
    try {
      if (idempotencyKey.startsWith("install:")) {
        await processInstall(idempotencyKey, req.body);
      } else {
        await processUninstall(idempotencyKey, req.body);
      }
    } catch (error) {
      // Avoid failing webhook retries because response is already sent.
      console.error("Webhook post-response processing failed", error);
    }
  });
});
