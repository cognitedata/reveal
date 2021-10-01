import { storage } from '@cognite/storage';

export class StorageProvider {
  getItem(key: string, defaultValue: unknown): Promise<unknown> {
    return Promise.resolve(storage.getFromLocalStorage(key, defaultValue));
  }

  setItem(key: string, value: unknown): Promise<void> {
    return new Promise((resolve) => {
      storage.saveToLocalStorage(key, value);
      resolve();
    });
  }

  removeItem(key: string): Promise<void> {
    return new Promise((resolve) => {
      storage.removeItem(key);
      resolve();
    });
  }
}
