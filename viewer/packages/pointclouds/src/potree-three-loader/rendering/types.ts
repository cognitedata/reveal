/*!
 * Copyright 2022 Cognite AS
 */
import { IUniform as IThreeUniform, Vector4 } from 'three';

export interface IClassification {
  [value: string]: Vector4;
  DEFAULT: Vector4;
}

export interface IUniform<T> extends IThreeUniform {
  type: string;
  value: T;
}
