/*!
 * Copyright 2026 Cognite AS
 */

export type TestRendererKind = 'webgl' | 'webgpu';

let currentTestRendererKind: TestRendererKind = 'webgl';

export function setTestRendererKind(kind: TestRendererKind): void {
  currentTestRendererKind = kind;
}

export function getTestRendererKind(): TestRendererKind {
  return currentTestRendererKind;
}
