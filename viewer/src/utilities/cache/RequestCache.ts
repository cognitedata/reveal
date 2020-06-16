/*!
 * Copyright 2020 Cognite AS
 */

export interface RequestCache<Key, Data> {
  has(key: Key): boolean;
  get(key: Key): Data;
  insert(key: Key, data: Data): void;
  forceInsert(key: Key, data: Data): void;
  remove(key: Key): void;
  isFull(): boolean;
  cleanCache(count: number): void;
  clear(): void;
}
