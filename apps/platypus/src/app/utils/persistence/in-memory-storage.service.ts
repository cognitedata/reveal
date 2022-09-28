/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValueMap, StorageProvider } from '@platypus/platypus-core';

export class MemoryStorageService implements StorageProvider {
  private dataStorage = {} as KeyValueMap;

  getKeys(): any {
    return Object.keys(this.dataStorage);
  }

  getItem(key: any): any {
    this.getAllItems();
    return this.dataStorage[key];
  }

  getAllItems(): any {
    return this.dataStorage;
  }

  setItem(key: any, value: any): void {
    this.dataStorage[key] = value;
  }

  removeItem(key: any): void {
    // eslint-disable-next-line no-prototype-builtins
    if (this.dataStorage.hasOwnProperty(key)) {
      delete this.dataStorage[key];
    }
  }

  clear(): void {
    this.dataStorage = {};
  }
}
