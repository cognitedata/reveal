/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  StorageProvider,
  STORAGE_PROVIDER_CONSTANTS,
} from '@platypus/platypus-core';

export class LocalStorageProvider implements StorageProvider {
  private appName = STORAGE_PROVIDER_CONSTANTS.APP_NAME;
  private orgName = STORAGE_PROVIDER_CONSTANTS.ORG_NAME;
  private subAppName = STORAGE_PROVIDER_CONSTANTS.SUB_APP_NAME;

  constructor(private project: string) {}

  clear(): void {
    localStorage.clear();
  }

  getKeys(): any {
    const keys = Object.keys(localStorage) || [];
    return keys.map((key) => this.getActualKeyName(key)).filter((key) => key);
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

  private getPrefix() {
    return [this.orgName, this.appName, this.subAppName, this.project].join(
      STORAGE_PROVIDER_CONSTANTS.DELIMITER
    );
  }

  private getQualifiedKeyName(key: string): string {
    return `${this.getPrefix()}${STORAGE_PROVIDER_CONSTANTS.DELIMITER}${key}`;
  }

  private getActualKeyName(key: string): string | null {
    const effectivePrefix =
      this.getPrefix() + STORAGE_PROVIDER_CONSTANTS.DELIMITER;
    if (key.startsWith(effectivePrefix))
      return key.substring(effectivePrefix.length);
    return null;
  }
}
