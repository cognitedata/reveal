/*!
 * Copyright 2020 Cognite AS
 */

export interface RequestCache<Key, Data> {
  has(key: Key): boolean;
  get(key: Key): Data;
  add(key: Key, data: Data): void;
  clear(): void;
}
