/*!
 * Copyright 2025 Cognite AS
 */
export function createUint8View(arrayView: ArrayBufferView): Uint8Array {
  return new Uint8Array(arrayView.buffer, arrayView.byteOffset, arrayView.byteLength);
}
