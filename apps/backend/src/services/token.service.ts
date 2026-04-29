import jwt, { JwtPayload } from "jsonwebtoken";

export type SessionClaims = {
  installed_app_id: string;
  organization_id: string;
  instance_id: string;
  user_id: string;
};

type SessionClaimsWithExp = SessionClaims & JwtPayload;

function getSecret(): string {
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
}

function getTtlMinutes(): number {
  const ttl = Number(process.env.JWT_TTL_MINUTES ?? "30");
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 30;
}

export function issuePortalToken(claims: SessionClaims): string {
  const secret = getSecret();
  const ttlMinutes = getTtlMinutes();
  return jwt.sign(claims, secret, {
    expiresIn: `${ttlMinutes}m`,
  });
}

export function verifyPortalToken(token: string): SessionClaimsWithExp {
  const secret = getSecret();
  return jwt.verify(token, secret) as SessionClaimsWithExp;
}
