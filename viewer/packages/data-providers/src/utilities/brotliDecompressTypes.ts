/*!
 * Copyright 2026 Cognite AS
 */

// The 'brotli' package only ships types for its main (compress + decompress) entry point.
// We only need the decode-only submodule to avoid bundling the unused encoder.
declare module 'brotli/decompress' {
  export default function decompress(buffer: Uint8Array, outputSize?: number): Uint8Array;
}
