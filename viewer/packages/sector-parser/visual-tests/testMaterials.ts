/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

// TODO: Fix dependencies such that test app doesn't depend on core internals
import { getMatCapTextureData } from '../../../packages/rendering/src/rendering/matCapTextureData';
import { sectorShaders } from '../../../packages/rendering/src/rendering/shaders';
import { RevealGeometryCollectionType } from '../src/types';

const matCapTexture = new THREE.Texture(getMatCapTextureData());
matCapTexture.needsUpdate = true;

function getColorDataTexture(treeIndexCount: number) {
  const { width, height } = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = width * height;

  const buffer = new Uint8ClampedArray(4 * textureElementCount);
  for (let i = 0; i < textureElementCount; i++) {
    buffer[i * 4 + 3] = 1;
  }
  // Color and style override texture
  const overrideColorPerTreeIndexTexture = new THREE.DataTexture(buffer, width, height);

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

export function getMaterialsMap(treeIndexCount: number): Map<RevealGeometryCollectionType, THREE.RawShaderMaterial> {
  const { colorDataTexture, width, height } = getColorDataTexture(treeIndexCount);
  colorDataTexture.needsUpdate = true;

  const sharedParams: THREE.ShaderMaterialParameters = {
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(width, height) },
      colorDataTexture: { value: colorDataTexture }
    },
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    blending: THREE.CustomBlending,
    blendDst: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
    blendSrc: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor
  };
  return new Map([
    [
      RevealGeometryCollectionType.BoxCollection,
      createMaterial(
        'Primitives (Box)',
        sectorShaders.boxPrimitive.vertex,
        sectorShaders.boxPrimitive.fragment,
        sharedParams
      )
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
      createMaterial(
        'Primitives (Cone)',
        sectorShaders.conePrimitive.vertex,
        sectorShaders.conePrimitive.fragment,
        sharedParams
      )
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
      createMaterial(
        'Primitives (Quad)',
        sectorShaders.quadPrimitive.vertex,
        sectorShaders.quadPrimitive.fragment,
        sharedParams
      )
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
      createMaterial(
        'Primitives (Nut)',
        sectorShaders.nutPrimitive.vertex,
        sectorShaders.nutPrimitive.fragment,
        sharedParams
      )
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

function createMaterial(
  name: string,
  vertexShader: string,
  fragmentShader: string,
  sharedParams: THREE.ShaderMaterialParameters
): THREE.RawShaderMaterial {
  return new THREE.RawShaderMaterial({
    ...sharedParams,
    name,
    vertexShader,
    fragmentShader
  });
}
