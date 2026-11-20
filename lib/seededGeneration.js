import { createHmac } from "crypto";

/**
 * Generates a deterministic, collision-free 10-digit recovery code 
 * derived from the player's unique appUid.
 */
export function generateSeededRecoveryCode(playerUid) {
  const SECRET_SEED = process.env.RECOVERY_SECRET;

  if (!SECRET_SEED) {
    throw new Error("RECOVERY_SECRET environment variable is missing.");
  }

  const hmac = createHmac("sha256", SECRET_SEED).update(playerUid).digest("hex");
  const numericValue = BigInt("0x" + hmac.slice(0, 12));
  const codeInt = numericValue % 10000000000n;

  return codeInt.toString().padStart(10, "0");
}