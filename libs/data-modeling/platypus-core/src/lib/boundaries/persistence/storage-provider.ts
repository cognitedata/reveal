export abstract class StorageProvider {
  /**
   * Empties the list associated with the object of all key/value pairs, if there are any.
   */
  abstract clear(): void;

  /**
   * Gets all available keys (i.e. storage object property names) from the storage
   */
  abstract getKeys(): string[] | any | null;

  /**
   * value = storage[key]
   */
  abstract getItem(key: string): string | any | null;

  /**
   * delete storage[key]
   */
  abstract removeItem(key: string): void;

  /**
   * storage[key] = value
   */
  abstract setItem(key: string | any, value: string | any): void;
}
