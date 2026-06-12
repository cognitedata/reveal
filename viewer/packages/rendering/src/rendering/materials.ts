/*!
 * Copyright 2021 Cognite AS
 */

import type { DataTexture, Texture } from 'three';
import { DoubleSide, GLSL3, Matrix4, RawShaderMaterial, Vector2, Vector3 } from 'three';
import { sectorShaders } from './shaders';
import { RenderMode } from './RenderMode';

export interface Materials {
  // Materials
  box: RawShaderMaterial;
  circle: RawShaderMaterial;
  generalRing: RawShaderMaterial;
  nut: RawShaderMaterial;
  quad: RawShaderMaterial;
  cone: RawShaderMaterial;
  eccentricCone: RawShaderMaterial;
  torusSegment: RawShaderMaterial;
  generalCylinder: RawShaderMaterial;
  trapezium: RawShaderMaterial;
  ellipsoidSegment: RawShaderMaterial;
  instancedMesh: RawShaderMaterial;
  triangleMesh: RawShaderMaterial;
  texturedMaterials: { [key: string]: RawShaderMaterial };
}

export function forEachMaterial(materials: Materials, callback: (material: RawShaderMaterial) => void): void {
  for (const materialOrMaterialSet of Object.values(materials)) {
    if (materialOrMaterialSet.isMaterial === true) {
      callback(materialOrMaterialSet as RawShaderMaterial);
    } else {
      const materialSet = materialOrMaterialSet as { [key: string]: RawShaderMaterial };

      Object.values(materialSet).forEach(material => callback(material));
    }
  }
}

export function createMaterials(
  overrideColorPerTreeIndex: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  transformOverrideLookupTexture: DataTexture,
  matCapTexture: Texture
): Materials {
  const boxMaterial = new RawShaderMaterial({
    name: 'Primitives (Box)',
    clipping: true,
    clippingPlanes: [],
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    side: DoubleSide,
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },
    glslVersion: GLSL3
  });

  const circleMaterial = new RawShaderMaterial({
    name: 'Primitives (Circle)',
    clipping: true,
    clippingPlanes: [],
    vertexShader: sectorShaders.circlePrimitive.vertex,
    fragmentShader: sectorShaders.circlePrimitive.fragment,
    // TODO double side is not necessary for all,
    // we should indicate this in the data from Rust
    side: DoubleSide,
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },
    glslVersion: GLSL3
  });

  const nutMaterial = new RawShaderMaterial({
    name: 'Primitives (Nuts)',
    clipping: true,
    clippingPlanes: [],
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const quadMaterial = new RawShaderMaterial({
    name: 'Primitives (Quads)',
    clipping: true,
    clippingPlanes: [],
    vertexShader: sectorShaders.quadPrimitive.vertex,
    fragmentShader: sectorShaders.quadPrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const generalRingMaterial = new RawShaderMaterial({
    name: 'Primitives (General rings)',
    clipping: true,
    clippingPlanes: [],
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },
    vertexShader: sectorShaders.generalRingPrimitive.vertex,
    fragmentShader: sectorShaders.generalRingPrimitive.fragment,
    // TODO we can avoid drawing DoubleSide if we flip the ring in Rust and adjust the angle and
    // arc_angle accordingly
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const coneMaterial = new RawShaderMaterial({
    name: 'Primitives (Cone)',
    clipping: true,
    clippingPlanes: [],
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },
    vertexShader: sectorShaders.conePrimitive.vertex,
    fragmentShader: sectorShaders.conePrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const eccentricConeMaterial = new RawShaderMaterial({
    name: 'Primitives (Eccentric cone)',
    clipping: true,
    clippingPlanes: [],
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },
    vertexShader: sectorShaders.eccentricConePrimitive.vertex,
    fragmentShader: sectorShaders.eccentricConePrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const ellipsoidSegmentMaterial = new RawShaderMaterial({
    name: 'Primitives (Ellipsoid segments)',
    clipping: true,
    clippingPlanes: [],
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },

    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const generalCylinderMaterial = new RawShaderMaterial({
    name: 'Primitives (General cylinder)',
    clipping: true,
    clippingPlanes: [],
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      },
      cameraPosition: {
        value: new Vector3()
      }
    },
    vertexShader: sectorShaders.generalCylinderPrimitive.vertex,
    fragmentShader: sectorShaders.generalCylinderPrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const trapeziumMaterial = new RawShaderMaterial({
    name: 'Primitives (Trapezium)',
    clipping: true,
    clippingPlanes: [],
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },
    vertexShader: sectorShaders.trapeziumPrimitive.vertex,
    fragmentShader: sectorShaders.trapeziumPrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const torusSegmentMaterial = new RawShaderMaterial({
    name: 'Primitives (Torus segment)',
    clipping: true,
    clippingPlanes: [],
    uniforms: {
      inverseModelMatrix: {
        value: new Matrix4()
      }
    },
    vertexShader: sectorShaders.torusSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.torusSegmentPrimitive.fragment,
    side: DoubleSide,
    glslVersion: GLSL3
  });

  const triangleMeshMaterial = new RawShaderMaterial({
    name: 'Triangle meshes',
    clipping: true,
    clippingPlanes: [],
    side: DoubleSide,
    fragmentShader: sectorShaders.detailedMesh.fragment,
    vertexShader: sectorShaders.detailedMesh.vertex,
    glslVersion: GLSL3
  });

  const instancedMeshMaterial = new RawShaderMaterial({
    name: 'Instanced meshes',
    clipping: true,
    clippingPlanes: [],
    side: DoubleSide,
    fragmentShader: sectorShaders.instancedMesh.fragment,
    vertexShader: sectorShaders.instancedMesh.vertex,
    glslVersion: GLSL3
  });

  const allMaterials = {
    box: boxMaterial,
    circle: circleMaterial,
    nut: nutMaterial,
    generalRing: generalRingMaterial,
    quad: quadMaterial,
    cone: coneMaterial,
    eccentricCone: eccentricConeMaterial,
    torusSegment: torusSegmentMaterial,
    generalCylinder: generalCylinderMaterial,
    trapezium: trapeziumMaterial,
    ellipsoidSegment: ellipsoidSegmentMaterial,
    instancedMesh: instancedMeshMaterial,
    triangleMesh: triangleMeshMaterial,
    texturedMaterials: {}
  };

  forEachMaterial(allMaterials, material =>
    initializeDefinesAndUniforms(
      material,
      overrideColorPerTreeIndex,
      transformOverrideIndexTexture,
      transformOverrideLookupTexture,
      matCapTexture,
      RenderMode.Color
    )
  );

  return {
    ...allMaterials
  };
}

export function initializeDefinesAndUniforms(
  material: RawShaderMaterial,
  overrideColorPerTreeIndex: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  transformOverrideTexture: DataTexture,
  matCapTexture: Texture,
  renderMode: RenderMode
): void {
  const treeIndexTextureSize = new Vector2(
    overrideColorPerTreeIndex.image.width,
    overrideColorPerTreeIndex.image.height
  );
  const transformOverrideTextureSize = new Vector2(
    transformOverrideTexture.image.width,
    transformOverrideTexture.image.height
  );
  const oldUniforms = material.uniforms;
  material.setValues({
    defines: {
      ...material.defines
    },
    uniforms: {
      ...oldUniforms,
      renderMode: {
        value: renderMode
      },
      treeIndexTextureSize: {
        value: treeIndexTextureSize
      },
      transformOverrideTextureSize: {
        value: transformOverrideTextureSize
      },
      colorDataTexture: {
        value: overrideColorPerTreeIndex
      },
      transformOverrideIndexTexture: {
        value: transformOverrideIndexTexture
      },
      transformOverrideTexture: {
        value: transformOverrideTexture
      },
      matCapTexture: {
        value: matCapTexture
      }
    }
  });

  material.uniformsNeedUpdate = true;
}
