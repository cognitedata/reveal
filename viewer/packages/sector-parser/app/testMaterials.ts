/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

// TODO: Fix dependencies such that test app doesn't depend on core internals
import matCapTextureImage from '../../../packages/rendering/src/rendering/matCapTextureData';
import { sectorShaders } from '../../../packages/rendering/src/rendering/shaders';

const matCapTexture = new THREE.Texture(matCapTextureImage);
matCapTexture.needsUpdate = true;

const blendingOptions = {
  blending: THREE.CustomBlending,
  blendDst: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
  blendSrc: THREE.OneFactor,
  blendSrcAlpha: THREE.ZeroFactor
};

export function createInstancedMeshMaterial(): THREE.RawShaderMaterial {
  return new THREE.RawShaderMaterial({
    name: 'Instanced meshes',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: {
      derivatives: true
    },
    side: THREE.DoubleSide,
    fragmentShader: sectorShaders.instancedMesh.fragment,
    vertexShader: sectorShaders.instancedMesh.vertex,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });
}

export function createGeneralCylinderMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (General cylinder)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      cameraPosition: {
        value: new THREE.Vector3()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.generalCylinderPrimitive.vertex,
    fragmentShader: sectorShaders.generalCylinderPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createTriangleMeshMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Triangle meshes',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: {
      derivatives: true
    },
    side: THREE.DoubleSide,
    fragmentShader: sectorShaders.detailedMesh.fragment,
    vertexShader: sectorShaders.detailedMesh.vertex,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createBoxMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Box)',
    clipping: false,
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createCircleMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Circle)',
    clipping: false,
    vertexShader: sectorShaders.circlePrimitive.vertex,
    fragmentShader: sectorShaders.circlePrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createConeMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Cone)',
    clipping: false,
    vertexShader: sectorShaders.conePrimitive.vertex,
    fragmentShader: sectorShaders.conePrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createEccentricConeMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Eccentric cone)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.eccentricConePrimitive.vertex,
    fragmentShader: sectorShaders.eccentricConePrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createGeneralRingMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (General rings)',
    clipping: false,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: { value: 1 },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.generalRingPrimitive.vertex,
    fragmentShader: sectorShaders.generalRingPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createEllipsoidSegmentMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Ellipsoid segments)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createNutMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Nuts)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createQuadMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Quads)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.quadPrimitive.vertex,
    fragmentShader: sectorShaders.quadPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createTrapeziumMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Trapezium)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.trapeziumPrimitive.vertex,
    fragmentShader: sectorShaders.trapeziumPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}

export function createTorusSegmentMaterial(): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    name: 'Primitives (Torus segment)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: {
      derivatives: true
    },
    vertexShader: sectorShaders.torusSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.torusSegmentPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3,
    ...blendingOptions
  });

  material.uniforms.colorDataTexture.value.needsUpdate = true;

  return material;
}
