import {
  StorageProvider,
  STORAGE_PROVIDER_CONSTANTS,
} from '@platypus/platypus-core';

export class SessionStorageProvider implements StorageProvider {
  private prefix = STORAGE_PROVIDER_CONSTANTS.PREFIX;

  clear(): void {
    sessionStorage.clear();
  }

  getItem(key: string): any {
    const item = sessionStorage.getItem(this.getQualifiedKeyName(key));
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
    sessionStorage.removeItem(this.getQualifiedKeyName(key));
  }

  setItem(key: string, value: any): void {
    let sanitizedValue = value;

    // keep consistent values, transform undefined to null
    if (sanitizedValue === undefined) {
      sanitizedValue = null;
    }

    if (
      // eslint-disable-next-line lodash/prefer-lodash-typecheck
      typeof sanitizedValue !== 'string' &&
      !(sanitizedValue instanceof String)
    ) {
      sanitizedValue = JSON.stringify(value);
    }

    sessionStorage.setItem(
      this.getQualifiedKeyName(key),
      JSON.stringify(value)
    );
  }

  private getQualifiedKeyName(key: string): string {
    return `${this.prefix}.${key}`;
  }
}
