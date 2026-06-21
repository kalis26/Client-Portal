import { hash, verify } from "@node-rs/argon2";

export const passwordPolicy = zPassword;
function zPassword(password: string) { return password.length >= 12 && password.length <= 128; }

export async function hashPassword(password: string) {
  if (!zPassword(password)) throw new Error("Password does not meet the security requirement.");
  return hash(password, { memoryCost: 19_456, timeCost: 2, parallelism: 1, outputLen: 32 });
}
export async function verifyPassword(passwordHash: string, password: string) { return verify(passwordHash, password); }
