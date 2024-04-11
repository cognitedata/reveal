/*!
 * Adapted from pnext/three-loader (https://github.com/pnext/three-loader)
 */
import { Color, IUniform as IThreeUniform, Vector4 } from 'three';

export type IGradient = [number, Color][];

export type PointClassification = {
  [value: string]: Vector4;
  DEFAULT: Vector4;
};

export type IUniform<T> = {
  type: string;
  value: T;
} & IThreeUniform;

export type OctreeMaterialParams = {
  scale: THREE.Vector3;
  spacing: number;
  boundingBox: THREE.Box3;
};
