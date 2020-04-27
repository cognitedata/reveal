/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { sectorShaders, shaderDefines } from './shaders';
import { RenderMode } from '../materials';
import { determinePowerOfTwoDimensions } from '../../../utils/determinePowerOfTwoDimensions';
import matCapTextureImage from './matCapTextureData';

export interface Materials {
  // Materials
  box: THREE.ShaderMaterial;
  circle: THREE.ShaderMaterial;
  generalRing: THREE.ShaderMaterial;
  nut: THREE.ShaderMaterial;
  quad: THREE.ShaderMaterial;
  cone: THREE.ShaderMaterial;
  eccentricCone: THREE.ShaderMaterial;
  sphericalSegment: THREE.ShaderMaterial;
  torusSegment: THREE.ShaderMaterial;
  generalCylinder: THREE.ShaderMaterial;
  trapezium: THREE.ShaderMaterial;
  ellipsoidSegment: THREE.ShaderMaterial;
  instancedMesh: THREE.ShaderMaterial;
  triangleMesh: THREE.ShaderMaterial;
  simple: THREE.ShaderMaterial;
  // Data textures
  overrideColorPerTreeIndex: THREE.DataTexture;
  overrideVisibilityPerTreeIndex: THREE.DataTexture;
}

export function createMaterials(treeIndexCount: number): Materials {
  const textureDims = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = textureDims.width * textureDims.height;
  const dataTextureSize = new THREE.Vector2(textureDims.width, textureDims.height);

  const colors = new Uint8Array(4 * textureElementCount);
  const visibility = new Uint8Array(4 * textureElementCount);
  visibility.fill(255);
  const overrideColorPerTreeIndex = new THREE.DataTexture(colors, textureDims.width, textureDims.height);
  const overrideVisibilityPerTreeIndex = new THREE.DataTexture(visibility, textureDims.width, textureDims.height);

  const matCapTexture = new THREE.Texture(matCapTextureImage);
  matCapTexture.needsUpdate = true;

  const boxMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Box)',
    clipping: true,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const circleMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Circle)',
    clipping: true,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.circlePrimitive.vertex,
    fragmentShader: sectorShaders.circlePrimitive.fragment,
    // TODO double side is not necessary for all,
    // we should indicate this in the data from Rust
    side: THREE.DoubleSide
  });

  const nutMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Nuts)',
    clipping: true,
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const quadMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Quads)',
    clipping: true,
    vertexShader: sectorShaders.quadPrimitive.vertex,
    fragmentShader: sectorShaders.quadPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const generalRingMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (General rings)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.generalRingPrimitive.vertex,
    fragmentShader: sectorShaders.generalRingPrimitive.fragment,
    // TODO we can avoid drawing DoubleSide if we flip the ring in Rust and adjust the angle and
    // arc_angle accordingly
    side: THREE.DoubleSide
  });

  const coneMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Cone)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.conePrimitive.vertex,
    fragmentShader: sectorShaders.conePrimitive.fragment,
    side: THREE.DoubleSide
  });

  const eccentricConeMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Eccentric cone)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.eccentricConePrimitive.vertex,
    fragmentShader: sectorShaders.eccentricConePrimitive.fragment,
    side: THREE.DoubleSide
  });

  const ellipsoidSegmentMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Ellipsoid segments)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const generalCylinderMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (General cylinder)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.generalCylinderPrimitive.vertex,
    fragmentShader: sectorShaders.generalCylinderPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const trapeziumMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Trapezium)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.trapeziumPrimitive.vertex,
    fragmentShader: sectorShaders.trapeziumPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const torusSegmentMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Torus segment)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: {
      fragDepth: true,
      derivatives: true
    },
    vertexShader: sectorShaders.torusSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.torusSegmentPrimitive.fragment,
    // TODO we can drop the double sided rendering if we add end caps
    side: THREE.DoubleSide
  });

  const sphericalSegmentMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Spherical segment)',
    clipping: true,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const triangleMeshMaterial = new THREE.ShaderMaterial({
    name: 'Triangle meshes',
    clipping: true,
    extensions: {
      derivatives: true
    },
    side: THREE.DoubleSide,
    fragmentShader: sectorShaders.detailedMesh.fragment,
    vertexShader: sectorShaders.detailedMesh.vertex,
  });

  const instancedMeshMaterial = new THREE.ShaderMaterial({
    name: 'Instanced meshes',
    clipping: true,
    extensions: {
      derivatives: true
    },
    side: THREE.DoubleSide,
    fragmentShader: sectorShaders.instancedMesh.fragment,
    vertexShader: sectorShaders.instancedMesh.vertex
  });

  const simpleMaterial = new THREE.ShaderMaterial({
    name: 'Low detail material',
    clipping: true,
    fragmentShader: sectorShaders.simpleMesh.fragment,
    vertexShader: sectorShaders.simpleMesh.vertex,
  });

  const allMaterials = {
    box: boxMaterial,
    circle: circleMaterial,
    nut: nutMaterial,
    generalRing: generalRingMaterial,
    quad: quadMaterial,
    cone: coneMaterial,
    eccentricCone: eccentricConeMaterial,
    sphericalSegment: sphericalSegmentMaterial,
    torusSegment: torusSegmentMaterial,
    generalCylinder: generalCylinderMaterial,
    trapezium: trapeziumMaterial,
    ellipsoidSegment: ellipsoidSegmentMaterial,
    instancedMesh: instancedMeshMaterial,
    triangleMesh: triangleMeshMaterial,
    simple: simpleMaterial
  };
  for (const material of Object.values(allMaterials)) {
    updateDefinesAndUniforms(
      material,
      dataTextureSize,
      overrideColorPerTreeIndex,
      overrideVisibilityPerTreeIndex,
      matCapTexture
    );
  }

  return { ...allMaterials, overrideColorPerTreeIndex, overrideVisibilityPerTreeIndex };
}

function updateDefinesAndUniforms(
  material: THREE.ShaderMaterial,
  dataTextureSize: THREE.Vector2,
  overrideColorPerTreeIndex: THREE.DataTexture,
  overrideVisibilityPerTreeIndex: THREE.DataTexture,
  matCapTexture: THREE.Texture
) {
  const oldUniforms = material.uniforms;
  material.setValues({
    ...shaderDefines,
    uniforms: {
      ...oldUniforms,
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: overrideColorPerTreeIndex
      },
      overrideVisibilityPerTreeIndex: {
        value: overrideVisibilityPerTreeIndex
      },
      dataTextureSize: {
        value: dataTextureSize
      },
      matCapTexture: {
        value: matCapTexture
      }
    }
  });
}
