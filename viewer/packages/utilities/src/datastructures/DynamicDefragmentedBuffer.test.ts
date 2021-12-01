/*!
 * Copyright 2021 Cognite AS
 */

import 'jest-extended';
import { DynamicDefragmentedBuffer } from './DynamicDefragmentedBuffer';

describe('DynamicDefragmentedBuffer', () => {
  test('empty array, returns empty', () => {
    const initialSize = 4;
    const result = new DynamicDefragmentedBuffer(initialSize, Float32Array);

    expect(result.length).toBe(0);
    expect(result.bufferView.length).toBe(initialSize);
  });

  test('adding should increment length', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1]);

    const addResult = result.add(adds);

    expect(result.length).toBe(adds.length);
    expect(addResult.batchId).toBe(0);
  });

  test('adding over initial size should increment buffer size', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1, 2, 3, 4]);

    result.add(adds);

    expect(result.length).toBe(adds.length);
    expect(result.bufferView.length).toBe(8);

    for (let i = 0; i < adds.length; i++) {
      expect(adds[i]).toBe(result.bufferView[i]);
    }
  });

  test('adding two batches should populate buffer', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([4, 5, 6]);

    const addResultOne = result.add(adds);
    const addResultTwo = result.add(addsTwo);

    for (let i = 0; i < adds.length; i++) {
      expect(adds[i]).toBe(result.bufferView[i]);
      expect(addsTwo[i]).toBe(result.bufferView[i + adds.length]);
    }

    expect(addResultOne.batchId).toBe(0);
    expect(addResultOne.bufferIsReallocated).toBeFalse();

    expect(addResultTwo.batchId).toBe(1);
    expect(addResultTwo.bufferIsReallocated).toBeTrue();
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
    const addResult = result.add(adds);

    result.remove(addResult.batchId);

    expect(result.length).toBe(0);
  });

  test('deleting middle batch should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    result.add(addsOne);
    const addResultTwo = result.add(addsTwo);
    result.add(addsThree);

    result.remove(addResultTwo.batchId);

    expect(result.length).toBe(addsOne.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.bufferView[i + addsOne.length]).toBe(addsThree[i]);
    }
  });

  test('deleting first batch then adding should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    const addResult = result.add(addsOne);
    result.add(addsTwo);

    result.remove(addResult.batchId);

    result.add(addsThree);

    expect(result.length).toBe(addsTwo.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsTwo[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.bufferView[i + addsTwo.length]).toBe(addsThree[i]);
    }
  });

  test('deleting last batch then adding should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    result.add(addsOne);
    const addResult = result.add(addsTwo);

    result.remove(addResult.batchId);

    result.add(addsThree);

    expect(result.length).toBe(addsOne.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.bufferView[i + addsOne.length]).toBe(addsThree[i]);
    }
  });

  test('Adding more than double of current size should correctly allocate new buffer', () => {
    const result = new DynamicDefragmentedBuffer(2, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    result.add(addsOne);
    result.add(addsTwo);

    expect(result.bufferView.length).toBe(32);
  });

  test('deleting two middle batches should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);
    const addsFour = new Float32Array([9, 10, 11, 12]);

    result.add(addsOne);
    const addResultTwo = result.add(addsTwo);
    const addResultThree = result.add(addsThree);
    result.add(addsFour);

    result.remove(addResultTwo.batchId);
    result.remove(addResultThree.batchId);

    expect(result.length).toBe(addsOne.length + addsFour.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsFour.length; i++) {
      expect(result.bufferView[i + addsOne.length]).toBe(addsFour[i]);
    }
  });
});
