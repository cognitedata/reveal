/*!
 * Copyright 2023 Cognite AS
 */

import { BufferAttribute } from 'three';
import { TypedArray } from '../types';

export class AttributeDataAccessor<T extends TypedArray> {
  private readonly _dataView: T;
  private readonly _attribute: BufferAttribute;
  constructor(dataView: T, attribute: BufferAttribute) {
    this._dataView = dataView;
    this._attribute = attribute;
  }

  public set(array: ArrayLike<number>, offset?: number | undefined): void {
    this._dataView.set(array, offset);
    this._attribute.needsUpdate = true;
  }

  public at(index: number): number | undefined {
    return this._dataView.at(index);
  }
}
