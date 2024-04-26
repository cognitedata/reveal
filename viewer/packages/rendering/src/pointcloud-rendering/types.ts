/*!
 * Adapted from pnext/three-loader (https://github.com/pnext/three-loader)
 */
import { Color, IUniform as IThreeUniform, Vector4, type Box3, type Vector3 } from 'three';

export type IGradient = [number, Color][];

export interface PointClassification {
  [value: string]: Vector4;
  DEFAULT: Vector4;
}

export interface IUniform<T> extends IThreeUniform {
  type: string;
  value: T;
}

export type OctreeMaterialParams = {
  scale: Vector3;
  spacing: number;
  boundingBox: Box3;
};
