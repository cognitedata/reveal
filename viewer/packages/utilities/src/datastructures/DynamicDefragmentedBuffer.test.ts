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
    expect(addResult.updateRange.byteOffset).toBe(0);
    expect(addResult.updateRange.byteCount).toBe(2);
  });

  test('adding over initial size should increment buffer size', () => {
    const result = new DynamicDefragmentedBuffer(4, Float32Array);
    const adds = new Float32Array([0, 1, 2, 3, 4]);

    const addResult = result.add(adds);

    expect(result.length).toBe(adds.length);
    expect(result.bufferView.length).toBe(8);

    for (let i = 0; i < adds.length; i++) {
      expect(adds[i]).toBe(result.bufferView[i]);
    }

    expect(addResult.updateRange.byteOffset).toBe(0);
    expect(addResult.updateRange.byteCount).toBe(5);
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

    expect(addResultOne.updateRange.byteOffset).toBe(0);
    expect(addResultOne.updateRange.byteCount).toBe(2);

    expect(addResultTwo.updateRange.byteOffset).toBe(2);
    expect(addResultTwo.updateRange.byteCount).toBe(3);
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

    const removeResult = result.remove(addResult.batchId);

    expect(result.length).toBe(0);

    expect(removeResult.byteOffset).toBe(0);
    expect(removeResult.byteCount).toBe(0);
  });

  test('deleting middle batch should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    const addResultOne = result.add(addsOne);
    const addResultTwo = result.add(addsTwo);
    const addResultThree = result.add(addsThree);

    expect(addResultOne.updateRange.byteOffset).toBe(0);
    expect(addResultOne.updateRange.byteCount).toBe(2);

    expect(addResultTwo.updateRange.byteOffset).toBe(2);
    expect(addResultTwo.updateRange.byteCount).toBe(3);

    expect(addResultThree.updateRange.byteOffset).toBe(5);
    expect(addResultThree.updateRange.byteCount).toBe(4);

    const removeResult = result.remove(addResultTwo.batchId);

    expect(result.length).toBe(addsOne.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.bufferView[i + addsOne.length]).toBe(addsThree[i]);
    }

    expect(removeResult.byteOffset).toBe(2);
    expect(removeResult.byteCount).toBe(4);
  });

  test('deleting first batch then adding should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    const addResultOne = result.add(addsOne);
    const addResultTwo = result.add(addsTwo);

    const removeResult = result.remove(addResultOne.batchId);

    const addResultThree = result.add(addsThree);

    expect(result.length).toBe(addsTwo.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsTwo[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.bufferView[i + addsTwo.length]).toBe(addsThree[i]);
    }

    expect(addResultOne.updateRange.byteOffset).toBe(0);
    expect(addResultOne.updateRange.byteCount).toBe(2);

    expect(addResultTwo.updateRange.byteOffset).toBe(2);
    expect(addResultTwo.updateRange.byteCount).toBe(3);

    expect(removeResult.byteOffset).toBe(0);
    expect(removeResult.byteCount).toBe(3);

    expect(addResultThree.updateRange.byteOffset).toBe(3);
    expect(addResultThree.updateRange.byteCount).toBe(4);
  });

  test('deleting last batch then adding should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);

    const addResultOne = result.add(addsOne);
    const addResultTwo = result.add(addsTwo);

    const removeResult = result.remove(addResultTwo.batchId);

    const addResultThree = result.add(addsThree);

    expect(result.length).toBe(addsOne.length + addsThree.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsThree.length; i++) {
      expect(result.bufferView[i + addsOne.length]).toBe(addsThree[i]);
    }

    expect(addResultOne.updateRange.byteOffset).toBe(0);
    expect(addResultOne.updateRange.byteCount).toBe(2);

    expect(addResultTwo.updateRange.byteOffset).toBe(2);
    expect(addResultTwo.updateRange.byteCount).toBe(3);

    expect(removeResult.byteOffset).toBe(2);
    expect(removeResult.byteCount).toBe(0);

    expect(addResultThree.updateRange.byteOffset).toBe(2);
    expect(addResultThree.updateRange.byteCount).toBe(4);
  });

  test('Adding more than double of current size should correctly allocate new buffer', () => {
    const result = new DynamicDefragmentedBuffer(2, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    const addResultOne = result.add(addsOne);
    const addResultTwo = result.add(addsTwo);

    expect(result.bufferView.length).toBe(32);

    expect(addResultOne.updateRange.byteOffset).toBe(0);
    expect(addResultOne.updateRange.byteCount).toBe(2);

    expect(addResultTwo.updateRange.byteOffset).toBe(2);
    expect(addResultTwo.updateRange.byteCount).toBe(15);
  });

  test('deleting two middle batches should correctly defragment the buffer', () => {
    const result = new DynamicDefragmentedBuffer(8, Float32Array);
    const addsOne = new Float32Array([0, 1]);
    const addsTwo = new Float32Array([2, 3, 4]);
    const addsThree = new Float32Array([5, 6, 7, 8]);
    const addsFour = new Float32Array([9, 10, 11, 12]);

    const addResultOne = result.add(addsOne);
    const addResultTwo = result.add(addsTwo);
    const addResultThree = result.add(addsThree);
    const addResultFour = result.add(addsFour);

    const removeResultOne = result.remove(addResultTwo.batchId);
    const removeResultTwo = result.remove(addResultThree.batchId);

    expect(result.length).toBe(addsOne.length + addsFour.length);

    for (let i = 0; i < addsOne.length; i++) {
      expect(result.bufferView[i]).toBe(addsOne[i]);
    }

    for (let i = 0; i < addsFour.length; i++) {
      expect(result.bufferView[i + addsOne.length]).toBe(addsFour[i]);
    }

    expect(addResultOne.updateRange.byteOffset).toBe(0);
    expect(addResultOne.updateRange.byteCount).toBe(2);

    expect(addResultTwo.updateRange.byteOffset).toBe(2);
    expect(addResultTwo.updateRange.byteCount).toBe(3);

    expect(addResultThree.updateRange.byteOffset).toBe(5);
    expect(addResultThree.updateRange.byteCount).toBe(4);

    expect(addResultFour.updateRange.byteOffset).toBe(9);
    expect(addResultFour.updateRange.byteCount).toBe(4);

    expect(removeResultOne.byteOffset).toBe(2);
    expect(removeResultOne.byteCount).toBe(8);

    expect(removeResultTwo.byteOffset).toBe(2);
    expect(removeResultTwo.byteCount).toBe(4);
  });
});
