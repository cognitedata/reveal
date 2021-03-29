/*!
 * Copyright 2021 Cognite AS
 */

import { TypedArray } from 'three';

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

  public get buffer(): T {
    return this._buffer;
  }

  private _buffer: T;
  private _numFilled: number;
  private _type: new (length: number) => T;

  private _batchMap: Map<number, Batch>;
  private _currentTail: Batch | undefined;

  private _batchIdCounter: number;

  constructor(initialSize: number, type: new (length: number) => T) {
    this._numFilled = 0;
    this._batchIdCounter = 0;
    this._batchMap = new Map<number, Batch>();

    this._type = type;

    const minimalPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(initialSize)));
    this._buffer = new type(minimalPowerOfTwo);
  }

  public add(array: T): number {
    if (this._numFilled + array.length > this._buffer.length) {
      this.incrementBufferSize();
    }

    this._buffer.set(array, this._numFilled);

    const batchId = this.createBatch(array);

    this._numFilled += array.length;

    return batchId;
  }

  public remove(batchId: number) {
    const batch = this._batchMap.get(batchId);

    if (!batch) {
      throw new Error('batch does not exist in buffer');
    }

    this._buffer.copyWithin(batch.from, batch.from + batch.count, this.buffer.length);

    this._numFilled -= batch.count;

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

    this._batchMap.delete(batchId);
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

  private incrementBufferSize(): void {
    const newSize = this._buffer.length * 2;

    const newBuffer = new this._type(newSize);
    newBuffer.set(this._buffer);

    this._buffer = newBuffer;
  }
}
