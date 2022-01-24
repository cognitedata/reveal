/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

// TODO: Fix dependencies such that test app doesn't depend on core internals
import matCapTextureImage from '../../../packages/rendering/src/rendering/matCapTextureData';
import { sectorShaders } from '../../../packages/rendering/src/rendering/shaders';

const matCapTexture = new THREE.Texture(matCapTextureImage);
matCapTexture.needsUpdate = true;

export function createInstancedMeshMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createGeneralCylinderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (General cylinder)',
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
    vertexShader: sectorShaders.generalCylinderPrimitive.vertex,
    fragmentShader: sectorShaders.generalCylinderPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3
  });
}

export function createTriangleMeshMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createBoxMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createCircleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createConeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createEccentricConeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createGeneralRingMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (General rings)',
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
    vertexShader: sectorShaders.generalRingPrimitive.vertex,
    fragmentShader: sectorShaders.generalRingPrimitive.fragment,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL3
  });
}

export function createEllipsoidSegmentMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createNutMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createQuadMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createTrapeziumMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}

export function createTorusSegmentMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
    glslVersion: THREE.GLSL3
  });
}
