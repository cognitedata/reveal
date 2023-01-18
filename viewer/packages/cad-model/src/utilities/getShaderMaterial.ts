/*!
 * Copyright 2023 Cognite AS
 */

import { Materials } from '@reveal/rendering';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { assertNever } from '@reveal/utilities';
import { RawShaderMaterial } from 'three';

export function getShaderMaterial(type: RevealGeometryCollectionType, materials: Materials): RawShaderMaterial {
  switch (type) {
    case RevealGeometryCollectionType.BoxCollection:
      return materials.box;
    case RevealGeometryCollectionType.CircleCollection:
      return materials.circle;
    case RevealGeometryCollectionType.ConeCollection:
      return materials.cone;
    case RevealGeometryCollectionType.EccentricConeCollection:
      return materials.eccentricCone;
    case RevealGeometryCollectionType.EllipsoidSegmentCollection:
      return materials.ellipsoidSegment;
    case RevealGeometryCollectionType.GeneralCylinderCollection:
      return materials.generalCylinder;
    case RevealGeometryCollectionType.GeneralRingCollection:
      return materials.generalRing;
    case RevealGeometryCollectionType.QuadCollection:
      return materials.quad;
    case RevealGeometryCollectionType.TorusSegmentCollection:
      return materials.torusSegment;
    case RevealGeometryCollectionType.TrapeziumCollection:
      return materials.trapezium;
    case RevealGeometryCollectionType.NutCollection:
      return materials.nut;
    case RevealGeometryCollectionType.TriangleMesh:
      return materials.triangleMesh;
    case RevealGeometryCollectionType.InstanceMesh:
      return materials.instancedMesh;
    default:
      assertNever(type);
  }
}
