import type { DirectRelationReference } from '@cognite/sdk';

export type AssetSimpleProperties = {
  object3D: DirectRelationReference;
  name: string;
  description: string;
};

export type CoreDmImage360CollectionProperties = {
  name: string;
};

export type CoreDmImage360Properties = {
  translationX: number;
  translationY: number;
  translationZ: number;
  eulerRotationX: number;
  eulerRotationY: number;
  eulerRotationZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  front: DirectRelationReference;
  back: DirectRelationReference;
  left: DirectRelationReference;
  right: DirectRelationReference;
  top: DirectRelationReference;
  bottom: DirectRelationReference;
  collection360: DirectRelationReference;
  station360: DirectRelationReference;
  takenAt: number;
};

export type CoreDmImage360AnnotationProperties = {
  polygon: number[];
  formatVersion: string;
};
