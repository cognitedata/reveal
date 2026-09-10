/*!
 * Copyright 2026 Cognite AS
 */

import { detectJpegType, findProgressiveScanCutpoints, makePartialJpegBlob } from './JpegDataStreamParser';

describe(detectJpegType.name, () => {
  test('returns unknown for buffer shorter than 4 bytes', () => {
    expect(detectJpegType(new Uint8Array([0xff, 0xd8, 0xff]))).toBe('unknown');
    expect(detectJpegType(new Uint8Array([]))).toBe('unknown');
    expect(detectJpegType(new Uint8Array([0xff, 0xd8]))).toBe('unknown');
  });

  test('returns unknown for non-JPEG (no FF D8 at start)', () => {
    expect(detectJpegType(new Uint8Array([0x00, 0x00, 0x00, 0x00]))).toBe('unknown');
    expect(detectJpegType(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe('unknown');
  });

  test('returns progressive when SOF2 (FF C2) found after segment headers', () => {
    // SOI + APP0 (length=4, 2 data bytes) + SOF2
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc2]);
    expect(detectJpegType(buffer)).toBe('progressive');
  });

  test('returns baseline when SOF0 (FF C0) found after segment headers', () => {
    // SOI + APP0 (length=4, 2 data bytes) + SOF0
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0]);
    expect(detectJpegType(buffer)).toBe('baseline');
  });

  test('returns baseline when SOF1 (FF C1) found after segment headers', () => {
    // SOI + APP0 (length=4, 2 data bytes) + SOF1
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc1]);
    expect(detectJpegType(buffer)).toBe('baseline');
  });

  test('returns unknown when buffer runs out before SOF marker is found', () => {
    // SOI + APP0 header only, no SOF follows (truncated after data bytes)
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00]);
    expect(detectJpegType(buffer)).toBe('unknown');
  });

  test('returns unknown when EOI (FF D9) found before SOF (malformed)', () => {
    // SOI + EOI immediately — no SOF
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    expect(detectJpegType(buffer)).toBe('unknown');
  });
});

describe(findProgressiveScanCutpoints.name, () => {
  test('returns empty array for non-JPEG buffer', () => {
    expect(findProgressiveScanCutpoints(new Uint8Array([0x00, 0x01, 0x02, 0x03]))).toEqual([]);
    expect(findProgressiveScanCutpoints(new Uint8Array([]))).toEqual([]);
  });

  test('returns cutpoint at position of EOI marker for a simple terminated buffer', () => {
    // SOI + EOI — i=2: FF D9 → push(2), break
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    expect(findProgressiveScanCutpoints(buffer)).toEqual([2]);
  });

  test('returns cutpoint after SOS entropy data ends when next real marker found', () => {
    // SOI + SOS (marker=DA, length=4, 2 header bytes 0x00 0x00) + entropy [0xAB, 0xCD] + real marker FF C0
    // SOS at i=2: hdrLen=(0x00<<8)|0x04=4; i advances to 2+2+4=8 (first entropy byte)
    // entropy: 0xAB (i=8→9), 0xCD (i=9→10), then FF C0 at i=10 → real marker → foundEndOfScan=true, cutpoint=10
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xab, 0xcd, 0xff, 0xc0]);
    expect(findProgressiveScanCutpoints(buffer)).toEqual([10]);
  });

  test('does not push cutpoint if buffer runs out mid-scan (incomplete data)', () => {
    // SOI + SOS (length=4, 2 header bytes) + entropy [0xAB] — buffer ends, no terminating marker
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xab]);
    expect(findProgressiveScanCutpoints(buffer)).toEqual([]);
  });

  test('handles byte stuffing: FF 00 inside entropy data is NOT treated as a marker', () => {
    // SOI + SOS (length=4, 2 header bytes) + entropy [FF 00 (stuffed), 0xAB] + real marker FF C0
    // FF 00 is byte stuffing → skip 2 bytes; then 0xAB; then FF C0 → cutpoint at 11
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xff, 0x00, 0xab, 0xff, 0xc0]);
    expect(findProgressiveScanCutpoints(buffer)).toEqual([11]);
  });
});

function readBlobBytes(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

describe(makePartialJpegBlob.name, () => {
  test('creates blob of size cutpoint+2', () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xab, 0xcd, 0xef]);
    const cutpoint = 3;
    const blob = makePartialJpegBlob(buffer, cutpoint);
    expect(blob.size).toBe(cutpoint + 2);
  });

  test('last two bytes are 0xFF, 0xD9 (EOI)', async () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xab, 0xcd]);
    const cutpoint = 2;
    const blob = makePartialJpegBlob(buffer, cutpoint);
    const bytes = await readBlobBytes(blob);
    expect(bytes[bytes.length - 2]).toBe(0xff);
    expect(bytes[bytes.length - 1]).toBe(0xd9);
  });

  test('blob type is image/jpeg', () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xab]);
    const blob = makePartialJpegBlob(buffer, 2);
    expect(blob.type).toBe('image/jpeg');
  });

  test('blob contains the original bytes up to cutpoint', async () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xaa, 0xbb, 0xcc]);
    const cutpoint = 3;
    const blob = makePartialJpegBlob(buffer, cutpoint);
    const bytes = await readBlobBytes(blob);
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xd8);
    expect(bytes[2]).toBe(0xaa);
  });
});
