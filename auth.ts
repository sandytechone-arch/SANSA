import jwt from "jsonwebtoken";
import crypto from "crypto";
import { type Request, type Response } from "express";
import type { AuthUser } from "@workspace/api-zod";

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn("WARNING: JWT_SECRET not set. Using random secret - tokens will not persist across restarts.");
  return crypto.randomBytes(64).toString("hex");
})();
export const SESSION_COOKIE = "token";
export const SESSION_TTL = 24 * 60 * 60 * 1000;

export interface JwtPayload {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
}

export function signToken(user: AuthUser): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function setTokenCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export function clearTokenCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function getToken(req: Request): string | undefined {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies?.[SESSION_COOKIE];
}
