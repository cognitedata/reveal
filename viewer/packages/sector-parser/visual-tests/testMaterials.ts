/*!
 * Copyright 2026 Cognite AS
 */

import type { MaterialBackend } from '../../../packages/rendering/src/rendering/materialBackend';
import { createNodeMaterials } from '../../../packages/rendering/src/tsl/nodeMaterials';
import type { NodeMaterial } from 'three/webgpu';
import type { Material, RawShaderMaterial } from 'three';
import {
  CustomBlending,
  DataTexture,
  DoubleSide,
  GLSL3,
  Matrix4,
  OneFactor,
  RawShaderMaterial as ThreeRawShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  ZeroFactor
} from 'three';

import { createMatCapTexture } from '../../../packages/rendering/src/rendering/matCapTextureData';
import { sectorShaders } from '../../../packages/rendering/src/rendering/shaders';
import { RevealGeometryCollectionType } from '../src/types';

const matCapTexture = createMatCapTexture();

function getColorDataTexture(treeIndexCount: number) {
  const { width, height } = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = width * height;

  const buffer = new Uint8ClampedArray(4 * textureElementCount);
  for (let i = 0; i < textureElementCount; i++) {
    buffer[i * 4 + 3] = 1;
  }
  const overrideColorPerTreeIndexTexture = new DataTexture(buffer, width, height);

  return { colorDataTexture: overrideColorPerTreeIndexTexture, width, height };

  function determinePowerOfTwoDimensions(elementCount: number): { width: number; height: number } {
    const width = Math.max(1, ceilToPowerOfTwo(Math.sqrt(elementCount)));
    const height = Math.max(1, ceilToPowerOfTwo(elementCount / width));
    return { width, height };
  }

  function ceilToPowerOfTwo(v: number): number {
    return Math.pow(2, Math.ceil(Math.log(v) / Math.log(2)));
  }
}

function createWebglMaterialsMap(treeIndexCount: number): Map<RevealGeometryCollectionType, RawShaderMaterial> {
  const { colorDataTexture, width, height } = getColorDataTexture(treeIndexCount);
  colorDataTexture.needsUpdate = true;

  const sharedParams = {
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new Vector2(width, height) },
      colorDataTexture: { value: colorDataTexture }
    },
    side: DoubleSide,
    glslVersion: GLSL3,
    blending: CustomBlending,
    blendDst: ZeroFactor,
    blendDstAlpha: OneFactor,
    blendSrc: OneFactor,
    blendSrcAlpha: ZeroFactor
  };

  return new Map([
    [
      RevealGeometryCollectionType.BoxCollection,
      createMaterial('Primitives (Box)', sectorShaders.boxPrimitive.vertex, sectorShaders.boxPrimitive.fragment, sharedParams)
    ],
    [
      RevealGeometryCollectionType.CircleCollection,
      createMaterial(
        'Primitives (Circle)',
        sectorShaders.circlePrimitive.vertex,
        sectorShaders.circlePrimitive.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.ConeCollection,
      createMaterial('Primitives (Cone)', sectorShaders.conePrimitive.vertex, sectorShaders.conePrimitive.fragment, sharedParams)
    ],
    [
      RevealGeometryCollectionType.EccentricConeCollection,
      createMaterial(
        'Primitives (EccentricCone)',
        sectorShaders.eccentricConePrimitive.vertex,
        sectorShaders.eccentricConePrimitive.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.EllipsoidSegmentCollection,
      createMaterial(
        'Primitives (EllipsoidSegment)',
        sectorShaders.ellipsoidSegmentPrimitive.vertex,
        sectorShaders.ellipsoidSegmentPrimitive.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.GeneralCylinderCollection,
      createMaterial(
        'Primitives (GeneralCylinder)',
        sectorShaders.generalCylinderPrimitive.vertex,
        sectorShaders.generalCylinderPrimitive.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.GeneralRingCollection,
      createMaterial(
        'Primitives (GeneralRing)',
        sectorShaders.generalRingPrimitive.vertex,
        sectorShaders.generalRingPrimitive.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.QuadCollection,
      createMaterial('Primitives (Quad)', sectorShaders.quadPrimitive.vertex, sectorShaders.quadPrimitive.fragment, sharedParams)
    ],
    [
      RevealGeometryCollectionType.TorusSegmentCollection,
      createMaterial(
        'Primitives (TorusSegment)',
        sectorShaders.torusSegmentPrimitive.vertex,
        sectorShaders.torusSegmentPrimitive.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.TrapeziumCollection,
      createMaterial(
        'Primitives (Trapezium)',
        sectorShaders.trapeziumPrimitive.vertex,
        sectorShaders.trapeziumPrimitive.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.NutCollection,
      createMaterial('Primitives (Nut)', sectorShaders.nutPrimitive.vertex, sectorShaders.nutPrimitive.fragment, sharedParams)
    ],
    [
      RevealGeometryCollectionType.TriangleMesh,
      createMaterial(
        'Primitives (TriangleMesh)',
        sectorShaders.detailedMesh.vertex,
        sectorShaders.detailedMesh.fragment,
        sharedParams
      )
    ],
    [
      RevealGeometryCollectionType.InstanceMesh,
      createMaterial(
        'Primitives (InstancedMesh)',
        sectorShaders.instancedMesh.vertex,
        sectorShaders.instancedMesh.fragment,
        sharedParams
      )
    ]
  ]);
}

function createWebgpuMaterialsMap(treeIndexCount: number): Map<RevealGeometryCollectionType, NodeMaterial> {
  const { colorDataTexture, width, height } = getColorDataTexture(treeIndexCount);
  colorDataTexture.needsUpdate = true;

  const emptyTransformIndex = new DataTexture(new Float32Array(width * height), width, height);
  emptyTransformIndex.needsUpdate = true;
  const emptyTransformLookup = new DataTexture(new Float32Array(16), 16, 1);
  emptyTransformLookup.needsUpdate = true;

  const nodeMaterials = createNodeMaterials(colorDataTexture, emptyTransformIndex, emptyTransformLookup, matCapTexture);

  return new Map([
    [RevealGeometryCollectionType.BoxCollection, nodeMaterials.box],
    [RevealGeometryCollectionType.CircleCollection, nodeMaterials.circle],
    [RevealGeometryCollectionType.ConeCollection, nodeMaterials.cone],
    [RevealGeometryCollectionType.EccentricConeCollection, nodeMaterials.eccentricCone],
    [RevealGeometryCollectionType.EllipsoidSegmentCollection, nodeMaterials.ellipsoidSegment],
    [RevealGeometryCollectionType.GeneralCylinderCollection, nodeMaterials.generalCylinder],
    [RevealGeometryCollectionType.GeneralRingCollection, nodeMaterials.generalRing],
    [RevealGeometryCollectionType.QuadCollection, nodeMaterials.quad],
    [RevealGeometryCollectionType.TorusSegmentCollection, nodeMaterials.torusSegment],
    [RevealGeometryCollectionType.TrapeziumCollection, nodeMaterials.trapezium],
    [RevealGeometryCollectionType.NutCollection, nodeMaterials.nut],
    [RevealGeometryCollectionType.TriangleMesh, nodeMaterials.triangleMesh],
    [RevealGeometryCollectionType.InstanceMesh, nodeMaterials.instancedMesh]
  ]);
}

export function getMaterialsMap(treeIndexCount: number): Map<RevealGeometryCollectionType, RawShaderMaterial> {
  return createWebglMaterialsMap(treeIndexCount);
}

export function getMaterialsMapForBackend(
  treeIndexCount: number,
  backend: MaterialBackend
): Map<RevealGeometryCollectionType, Material> {
  return backend === 'webgpu'
    ? createWebgpuMaterialsMap(treeIndexCount)
    : createWebglMaterialsMap(treeIndexCount);
}

function createMaterial(
  name: string,
  vertexShader: string,
  fragmentShader: string,
  sharedParams: {
    clipping: boolean;
    uniforms: Record<string, { value: unknown }>;
    side: typeof DoubleSide;
    glslVersion: typeof GLSL3;
    blending: typeof CustomBlending;
    blendDst: typeof ZeroFactor;
    blendDstAlpha: typeof OneFactor;
    blendSrc: typeof OneFactor;
    blendSrcAlpha: typeof ZeroFactor;
  }
): ThreeRawShaderMaterial {
  return new ThreeRawShaderMaterial({
    ...sharedParams,
    name,
    vertexShader,
    fragmentShader
  });
}
