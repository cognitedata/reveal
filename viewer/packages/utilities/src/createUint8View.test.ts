/*!
 * Copyright 2025 Cognite AS
 */
import { createUint8View } from './createUint8View';

describe(createUint8View.name, () => {
  test('createUint8View creates a view of the buffer and not a copy', () => {
    const arrayBuffer = new ArrayBuffer(8);
    const arrayBufferView0 = new DataView(arrayBuffer);
    const arrayBufferView1 = new DataView(arrayBuffer, 2);

    const uint8View0 = createUint8View(arrayBufferView0);
    const uint8View1 = createUint8View(arrayBufferView1);

    uint8View0[2] = 0x42;
    uint8View1[1] = 0x43;

    expect(uint8View0[3]).toBe(0x43);
    expect(uint8View1[0]).toBe(0x42);
  });
});
