import { StorageProvider } from '@platypus/platypus-core';
import { Storage } from '@graphiql/toolkit';

export class GraphiqlStorageProvider implements Storage {
  private prefix: string;
  private localStorageProvider: StorageProvider;
  length: number;
  constructor(
    spaceExternalId: string,
    dataModelExternalId: string,
    dataModelVersion: string,
    localStorageProvider: StorageProvider
  ) {
    this.prefix = `${spaceExternalId}_${dataModelExternalId}_${dataModelVersion}`;
    this.localStorageProvider = localStorageProvider;
    this.length = 0;
  }
  getItem(key: string): string | null {
    return this.localStorageProvider.getItem(this.getKeyName(key));
  }
  setItem(key: string, value: string): void {
    this.localStorageProvider.setItem(this.getKeyName(key), value);
    this.length += 1;
  }
  removeItem(key: string): void {
    this.localStorageProvider.removeItem(this.getKeyName(key));
    this.length -= 1;
  }
  clear(): void {
    this.localStorageProvider.clear();
    this.length = 0;
  }

  private getKeyName(key: string): string {
    return `${this.prefix}_${key}`;
  }
}
