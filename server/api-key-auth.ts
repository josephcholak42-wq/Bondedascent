import crypto from "crypto";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("base64url");
  const fullKey = `ba_${raw}`;
  const prefix = fullKey.slice(0, 12);
  const hash = hashApiKey(fullKey);
  return { fullKey, prefix, hash };
}

export async function apiKeyAuth(req: Request, _res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const apiKeyHeader = req.headers["x-api-key"] as string | undefined;
  let key: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ba_")) {
    key = authHeader.slice(7);
  } else if (apiKeyHeader && apiKeyHeader.startsWith("ba_")) {
    key = apiKeyHeader;
  }

  if (!key) {
    return next();
  }

  try {
    const prefix = key.slice(0, 12);
    const apiKeyRecord = await storage.getApiKeyByPrefix(prefix);

    if (!apiKeyRecord) {
      return next();
    }

    if (apiKeyRecord.expiresAt && new Date(apiKeyRecord.expiresAt) < new Date()) {
      return next();
    }

    const hash = hashApiKey(key);
    if (hash !== apiKeyRecord.keyHash) {
      return next();
    }

    const user = await storage.getUser(apiKeyRecord.userId);
    if (!user) {
      return next();
    }

    (req as any).user = user;
    (req as any).isAuthenticated = () => true;
    (req as any).apiKeyId = apiKeyRecord.id;
    (req as any).apiKeyScopes = apiKeyRecord.scopes;

    storage.touchApiKeyLastUsed(apiKeyRecord.id).catch(() => {});

    next();
  } catch {
    next();
  }
}
