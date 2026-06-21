import { get, put } from "@vercel/blob";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { env } from "@/lib/env";

export async function storeImmutablePdf(input: { key: string; bytes: Uint8Array }) {
  return storeEncryptedFile(input);
}

export async function storeEncryptedFile(input: { key: string; bytes: Uint8Array }) {
  if (!env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required before storing client documents.");
  const key = documentEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(input.bytes), cipher.final()]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  const blob = await put(input.key, payload, { access: "private", addRandomSuffix: false, contentType: "application/octet-stream", allowOverwrite: false });
  return { key: blob.pathname };
}

export async function retrieveImmutablePdf(pathname: string) {
  return retrieveEncryptedFile(pathname);
}

export async function retrieveEncryptedFile(pathname: string) {
  const result = await get(pathname, { access: "private", useCache: false }); if (!result?.stream) throw new Error("Encrypted document could not be retrieved.");
  const reader = result.stream.getReader(); const chunks: Uint8Array[]=[]; for(;;){const {done,value}=await reader.read();if(done)break;if(value)chunks.push(value)} const payload = Buffer.concat(chunks); const key = documentEncryptionKey();
  const iv = payload.subarray(0, 12), tag = payload.subarray(12, 28), ciphertext = payload.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv); decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function documentEncryptionKey() {
  if (!env.DOCUMENT_ENCRYPTION_KEY) throw new Error("DOCUMENT_ENCRYPTION_KEY is required before storing client documents.");
  const key = Buffer.from(env.DOCUMENT_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) throw new Error("DOCUMENT_ENCRYPTION_KEY must be a 32-byte base64 value.");
  return key;
}
