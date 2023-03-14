/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  StorageProvider,
  STORAGE_PROVIDER_CONSTANTS,
} from '@platypus/platypus-core';

export class SessionStorageProvider implements StorageProvider {
  private appName = STORAGE_PROVIDER_CONSTANTS.APP_NAME;
  private orgName = STORAGE_PROVIDER_CONSTANTS.ORG_NAME;
  private subAppName = STORAGE_PROVIDER_CONSTANTS.SUB_APP_NAME;

  constructor(private project: string) {}

  clear(): void {
    sessionStorage.clear();
  }

  getKeys(): any {
    const keys = Object.keys(sessionStorage) || [];
    return keys.map((key) => this.getActualKeyName(key));
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
