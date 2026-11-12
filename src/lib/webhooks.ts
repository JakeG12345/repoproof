import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const processedDeliveries = new Set<string>();

export function sha256Hex(input: string | Buffer) {
  return createHash("sha256").update(input).digest("hex");
}

export function verifyGitHubSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  return safeEqual(signature, expected);
}

export function verifyTimestampFresh(timestampHeader: string | null, maxAgeMs = 5 * 60 * 1000) {
  if (!timestampHeader) return true;
  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) return false;
  return Math.abs(Date.now() - timestamp) <= maxAgeMs;
}

export function recordDeliveryOnce(provider: string, deliveryId: string) {
  const key = `${provider}:${deliveryId}`;
  if (processedDeliveries.has(key)) return false;
  processedDeliveries.add(key);
  return true;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.byteLength !== rightBuffer.byteLength) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
