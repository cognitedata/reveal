/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  StorageProvider,
  STORAGE_PROVIDER_CONSTANTS,
} from '@platypus/platypus-core';

export class LocalStorageProvider implements StorageProvider {
  private prefix = STORAGE_PROVIDER_CONSTANTS.PREFIX;

  clear(): void {
    localStorage.clear();
  }

  getKeys(): any {
    const keys = Object.keys(localStorage) || [];
    return keys.map((key) => this.getActualKeyName(key));
  }

  getItem(key: string): any {
    const item = localStorage.getItem(this.getQualifiedKeyName(key));
    if (!item || item === 'null') {
      return null;
    }

    try {
      return JSON.parse(item);
    } catch (e) {
      return item;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.getQualifiedKeyName(key));
  }

  setItem(key: string, value: any): void {
    let sanitizedValue = value;

    // keep consistent values, transform undefined to null
    if (sanitizedValue === undefined) {
      sanitizedValue = null;
    }

    if (
      // eslint-disable-next-line
      typeof sanitizedValue !== 'string' &&
      !(sanitizedValue instanceof String)
    ) {
      sanitizedValue = JSON.stringify(value);
    }

    localStorage.setItem(this.getQualifiedKeyName(key), JSON.stringify(value));
  }

  private getQualifiedKeyName(key: string): string {
    return `${this.prefix}.${key}`;
  }

  private getActualKeyName(key: string): string {
    const effectivePrefix = this.prefix + '.';
    if (key.startsWith(effectivePrefix))
      return key.substring(effectivePrefix.length);
    return key;
  }
}
