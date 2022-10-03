import { Color, IUniform as IThreeUniform, Vector4, Box3, Matrix4, Vector3} from 'three';

export type IGradient = [number, Color][];

export interface IClipBox {
  box: Box3;
  inverse: Matrix4;
  matrix: Matrix4;
  position: Vector3;
}

export interface IClassification {
  [value: string]: Vector4;
  DEFAULT: Vector4;
}

export interface IUniform<T> extends IThreeUniform {
  type: string;
  value: T;
}

export type OctreeMaterialParams = {
  scale: THREE.Vector3;
  spacing: number;
  boundingBox: THREE.Box3;
}
