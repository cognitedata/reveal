/*!
 * Copyright 2021 Cognite AS
 */

import { TypedArray } from '../types';

type Batch = {
  from: number;
  count: number;
  prev: Batch | undefined;
  next: Batch | undefined;
};

export class DynamicDefragmentedBuffer<T extends TypedArray> {
  public get length(): number {
    return this._numFilled;
  }

  public get bufferView(): T {
    return this._bufferView;
  }

  private _bufferView: T;
  private _numFilled: number;
  private readonly _type: new (length: number) => T;

  private readonly _batchMap: Map<number, Batch>;
  private _currentTail: Batch | undefined;

  private _batchIdCounter: number;

  constructor(initialSize: number, type: new (length: number) => T) {
    this._numFilled = 0;
    this._batchIdCounter = 0;
    this._batchMap = new Map<number, Batch>();

    this._type = type;

    const minimalPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(initialSize)));
    this._bufferView = new type(minimalPowerOfTwo);
  }

  public add(array: T): {
    batchId: number;
    bufferIsReallocated: boolean;
    updateRange: {
      byteOffset: number;
      byteCount: number;
    };
  } {
    let isReallocated = false;
    if (this._numFilled + array.length > this._bufferView.length) {
      const newSize = Math.pow(2, Math.ceil(Math.log2(this._numFilled + array.length)));
      this.allocateNewBuffer(newSize);
      isReallocated = true;
    }

    this._bufferView.set(array, this._numFilled);

    const batchId = this.createBatch(array);

    const byteOffset = this._numFilled;

    this._numFilled += array.length;

    const byteCount = array.length;

    return { batchId: batchId, bufferIsReallocated: isReallocated, updateRange: { byteOffset, byteCount } };
  }

  public remove(batchId: number): {
    updateRange: {
      byteOffset: number;
      byteCount: number;
    };
  } {
    const batch = this._batchMap.get(batchId);

    if (!batch) {
      throw new Error('batch does not exist in buffer');
    }

    this._bufferView.copyWithin(batch.from, batch.from + batch.count, this._numFilled);

    this._numFilled -= batch.count;

    const byteOffset = batch.from;
    const byteCount = this._numFilled - batch.from;

    if (this._currentTail === batch) {
      this._currentTail = batch.prev;
    }

    const prev = batch.prev;
    const next = batch.next;

    if (prev) {
      prev.next = next;
    }

    if (next) {
      next.prev = prev;
    }

    let currentBatch = next;

    while (currentBatch) {
      currentBatch.from -= batch.count;
      currentBatch = currentBatch.next;
    }

    this._batchMap.delete(batchId);

    return { updateRange: { byteOffset, byteCount } };
  }

  private createBatch(array: T) {
    const batch: Batch = {
      from: this._numFilled,
      count: array.length,
      prev: this._currentTail,
      next: undefined
    };

    if (this._currentTail) {
      this._currentTail.next = batch;
    }

    this._currentTail = batch;

    const batchId = this._batchIdCounter;
    this._batchIdCounter++;

    this._batchMap.set(batchId, batch);
    return batchId;
  }

  private allocateNewBuffer(newSize: number): void {
    const newBuffer = new this._type(newSize);
    newBuffer.set(this._bufferView);

    this._bufferView = newBuffer;
  }
}
