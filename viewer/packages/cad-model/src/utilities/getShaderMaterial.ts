/*!
 * Copyright 2026 Cognite AS
 */

import type { CadMaterials } from '@reveal/rendering';
import { isNodeMaterials } from '@reveal/rendering';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { assertNever } from '@reveal/utilities';
import type { Material, RawShaderMaterial } from 'three';

import { assert } from '@reveal/utilities/assert';

export function getShaderMaterial(type: RevealGeometryCollectionType, materials: CadMaterials): Material {
  assert(type !== RevealGeometryCollectionType.TexturedTriangleMesh);
  if (isNodeMaterials(materials)) {
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

export function getRawShaderMaterial(type: RevealGeometryCollectionType, materials: CadMaterials): RawShaderMaterial {
  const material = getShaderMaterial(type, materials);
  if ('isNodeMaterial' in material && material.isNodeMaterial === true) {
    throw new Error('Expected WebGL RawShaderMaterial but got WebGPU NodeMaterial');
  }
  return material as RawShaderMaterial;
}
