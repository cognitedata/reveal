/*!
 * Copyright 2022 Cognite AS
 */

export interface ILoader {
  load(node: any): void;

  parse(node: any, buffer: ArrayBuffer): void;
}
