/*!
 * Copyright 2026 Cognite AS
 */

import type { DataTexture, Texture } from 'three';
import type { NodeMaterial } from 'three/webgpu';

import { RenderMode } from '../rendering/RenderMode';
import { createCadSharedUniformNodes, setCadSharedRenderMode } from './CadSharedUniforms';
import {
  createBoxNodeMaterial,
  createInstancedMeshNodeMaterial,
  createNutNodeMaterial,
  createQuadNodeMaterial
} from './sector/InstancedMeshNodeMaterial';
import {
  createCircleNodeMaterial,
  createConeNodeMaterial,
  createEccentricConeNodeMaterial,
  createEllipsoidSegmentNodeMaterial,
  createGeneralCylinderNodeMaterial,
  createGeneralRingNodeMaterial,
  createTorusSegmentNodeMaterial,
  createTrapeziumNodeMaterial
} from './sector/AnalyticPrimitiveNodeMaterials';
import { createTriangleMeshNodeMaterial } from './sector/TriangleMeshNodeMaterial';

export interface NodeMaterials {
  box: NodeMaterial;
  circle: NodeMaterial;
  generalRing: NodeMaterial;
  nut: NodeMaterial;
  quad: NodeMaterial;
  cone: NodeMaterial;
  eccentricCone: NodeMaterial;
  torusSegment: NodeMaterial;
  generalCylinder: NodeMaterial;
  trapezium: NodeMaterial;
  ellipsoidSegment: NodeMaterial;
  instancedMesh: NodeMaterial;
  triangleMesh: NodeMaterial;
  texturedMaterials: Record<string, NodeMaterial>;
}

export function forEachNodeMaterial(materials: NodeMaterials, callback: (material: NodeMaterial) => void): void {
  for (const materialOrMaterialSet of Object.values(materials)) {
    if ('isNodeMaterial' in materialOrMaterialSet && materialOrMaterialSet.isNodeMaterial === true) {
      callback(materialOrMaterialSet as NodeMaterial);
    } else {
      const materialSet = materialOrMaterialSet as Record<string, NodeMaterial>;
      Object.values(materialSet).forEach(material => callback(material));
    }
  }
}

export function createNodeMaterials(
  overrideColorPerTreeIndex: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  transformOverrideLookupTexture: DataTexture,
  matCapTexture: Texture,
  renderMode: RenderMode = RenderMode.Color
): NodeMaterials {
  const sharedUniforms = createCadSharedUniformNodes(
    overrideColorPerTreeIndex,
    transformOverrideIndexTexture,
    transformOverrideLookupTexture,
    matCapTexture,
    renderMode
  );

  return {
    box: createBoxNodeMaterial(sharedUniforms),
    circle: createCircleNodeMaterial(sharedUniforms),
    nut: createNutNodeMaterial(sharedUniforms),
    generalRing: createGeneralRingNodeMaterial(sharedUniforms),
    quad: createQuadNodeMaterial(sharedUniforms),
    cone: createConeNodeMaterial(sharedUniforms),
    eccentricCone: createEccentricConeNodeMaterial(sharedUniforms),
    torusSegment: createTorusSegmentNodeMaterial(sharedUniforms),
    generalCylinder: createGeneralCylinderNodeMaterial(sharedUniforms),
    trapezium: createTrapeziumNodeMaterial(sharedUniforms),
    ellipsoidSegment: createEllipsoidSegmentNodeMaterial(sharedUniforms),
    instancedMesh: createInstancedMeshNodeMaterial(sharedUniforms),
    triangleMesh: createTriangleMeshNodeMaterial(sharedUniforms),
    texturedMaterials: {}
  };
}

export function setNodeMaterialsRenderMode(materials: NodeMaterials, renderMode: RenderMode): void {
  forEachNodeMaterial(materials, material => {
    const cadMaterial = material as NodeMaterial & { sharedUniforms?: { renderMode: { value: number } } };
    if (cadMaterial.sharedUniforms !== undefined) {
      setCadSharedRenderMode(cadMaterial.sharedUniforms, renderMode);
    }
    material.colorWrite = renderMode !== RenderMode.DepthBufferOnly;
  });
}
