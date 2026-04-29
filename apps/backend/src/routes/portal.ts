import { Router } from "express";
import { z } from "zod";
import { getActiveInstallationByInstalledAppId } from "../services/install.service";
import { issuePortalToken } from "../services/token.service";

const portalRequestSchema = z.object({
  installed_app_id: z.string(),
  app_id: z.string(),
  organization_id: z.string(),
  instance_id: z.string(),
  user_id: z.string(),
});

export const portalRouter = Router();

portalRouter.post("/", async (req, res) => {
  const parsed = portalRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    return;
  }

  const body = parsed.data;
  const installation = await getActiveInstallationByInstalledAppId(body.installed_app_id);
  if (!installation) {
    res.status(404).json({ error: "Installation not found" });
    return;
  }

  const token = issuePortalToken({
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
