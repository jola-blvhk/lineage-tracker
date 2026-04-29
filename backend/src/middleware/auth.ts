import { NextFunction, Request, Response } from "express";
import { SessionClaims, verifyPortalToken } from "../services/token.service";

export type AuthenticatedRequest = Request & { auth?: SessionClaims };

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    const claims = verifyPortalToken(token);
    req.auth = {
      installed_app_id: claims.installed_app_id,
      organization_id: claims.organization_id,
      instance_id: claims.instance_id,
      user_id: claims.user_id,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
