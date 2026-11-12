import "server-only";

export type StoredObject = {
  key: string;
  contentType: string;
  bytes: number;
  expiresAt?: string;
};

export type StorageAdapter = {
  putPrivateObject(input: {
    key: string;
    body: Uint8Array | string;
    contentType: string;
    expiresAt?: string;
  }): Promise<StoredObject>;
  deleteObject(key: string): Promise<void>;
};

const objects = new Map<string, StoredObject>();

export class MockStorageAdapter implements StorageAdapter {
  async putPrivateObject(input: {
    key: string;
    body: Uint8Array | string;
    contentType: string;
    expiresAt?: string;
  }) {
    const bytes = typeof input.body === "string" ? Buffer.byteLength(input.body) : input.body.byteLength;
    const stored = { key: input.key, contentType: input.contentType, bytes, expiresAt: input.expiresAt };
    objects.set(input.key, stored);
    return stored;
  }

  async deleteObject(key: string) {
    objects.delete(key);
  }
}

export function createStorageAdapter(): StorageAdapter {
  return new MockStorageAdapter();
}
