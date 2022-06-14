import { KeyValueMap } from '@platypus/platypus-core';

export class MemoryStorageService {
  private dataStorage = {} as KeyValueMap;

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
