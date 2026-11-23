import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.AI_CRED_AES_KEY = "iBc1Z2gYaAH4rEHs1dHQ2dvNQ6t4OfrdE1/Y6OSvtZY=";
});

import { decryptKey, encryptKey } from "@/lib/crypto/aes_gcm";

describe("aes_gcm decrypt", () => {
  it("round-trips a 16-byte tag", () => {
    const { ciphertext, iv, tag } = encryptKey("sk-teste");
    expect(decryptKey({ ciphertext, iv, tag })).toBe("sk-teste");
  });

  it("rejects a truncated tag instead of accepting a forgeable one", () => {
    const { ciphertext, iv, tag } = encryptKey("sk-teste");
    expect(() => decryptKey({ ciphertext, iv, tag: tag.subarray(0, 4) })).toThrow();
  });
});
