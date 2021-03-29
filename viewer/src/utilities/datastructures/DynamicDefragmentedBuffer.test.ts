/*!
 * Copyright 2021 Cognite AS
 */

import 'jest-extended';
import { DynamicDefragmentedBuffer } from './dynamicDefragmentedBuffer';

describe('DynamicDefragmentedBuffer', () => {
  test('empty array, returns empty', () => {
    const initialSize = 4;
    const result = new DynamicDefragmentedBuffer(initialSize, Float32Array);

    expect(result.length).toBe(0);
    expect(result.buffer.length).toBe(initialSize);
  });

  test('adding should increment length', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1]);

    const batchId = result.add(adds);

    expect(result.length).toBe(adds.length);
    expect(batchId).toBe(0);
  });

  test('adding over initial size should increment buffer size', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1, 2, 3, 4]);

    result.add(adds);

    expect(result.length).toBe(adds.length);
    expect(result.buffer.length).toBe(8);

    for (let i = 0; i < adds.length; i++) {
      expect(adds[i]).toBe(result.buffer[i]);
    }
  });

  test('adding two batches should populate buffer', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([4, 5, 6]);

    const batchIdOne = result.add(adds);
    const batchIdTwo = result.add(addsTwo);

    for (let i = 0; i < adds.length; i++) {
      expect(adds[i]).toBe(result.buffer[i]);
      expect(addsTwo[i]).toBe(result.buffer[i + adds.length]);
    }

    expect(batchIdOne).toBe(0);
    expect(batchIdTwo).toBe(1);
  });

  test('deleting non-existing batch should throw error', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    expect(() => {
      result.remove(0);
    }).toThrow();
  });

  test('adding, then deleting should give length 0', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1]);
    const batchId = result.add(adds);

    result.remove(batchId);

    expect(result.length).toBe(0);
  });

  test('deleting middle batch should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    result.add(addsOne);
    const batchIdTwo = result.add(addsTwo);
    result.add(addsThree);

    result.remove(batchIdTwo);

    expect(result.length).toBe(addsOne.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.buffer[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.buffer[i + addsOne.length]).toBe(addsThree[i]);
    }
  });

  test('deleting first batch then adding should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    const batchIdOne = result.add(addsOne);
    result.add(addsTwo);

    result.remove(batchIdOne);

    result.add(addsThree);

    expect(result.length).toBe(addsTwo.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.buffer[i]).toBe(addsTwo[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.buffer[i + addsTwo.length]).toBe(addsThree[i]);
    }
  });

  test('deleting last batch then adding should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    result.add(addsOne);
    const batchIdTwo = result.add(addsTwo);

    result.remove(batchIdTwo);

    result.add(addsThree);

    expect(result.length).toBe(addsOne.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.buffer[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.buffer[i + addsOne.length]).toBe(addsThree[i]);
    }
  });
});
