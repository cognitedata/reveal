/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { sectorShaders, shaderDefines } from './shaders';
import { RenderMode } from './RenderMode';
import { determinePowerOfTwoDimensions } from '@/utilities/determinePowerOfTwoDimensions';
import matCapTextureImage from './matCapTextureData';
import { Vector4, Matrix4, Euler } from 'three';

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
}

function packFloat(f: number) {
  const F = Math.abs(f);
  if (F === 0.0) {
    return new THREE.Vector4(0.0, 0.0, 0.0, 0.0);
  }
  const Sign = -f < 0.0 ? 0.0 : 1.0;

  let Exponent = Math.floor(Math.log2(F));

  const Mantissa = F / Math.pow(2, Exponent);
  //denormalized values if all exponent bits are zero
  if (Mantissa < 1.0) Exponent -= 1.0;

  Exponent += 127.0;

  const output = new THREE.Vector4(0.0, 0.0, 0.0, 0.0);

  output.x = Exponent;
  output.y = 128.0 * Sign + (Math.floor(Mantissa * 128.0) % 128.0);
  output.z = Math.floor(Math.floor(Mantissa * Math.pow(2.0, 23.0 - 8.0)) % Math.pow(2.0, 8.0));
  output.w = Math.floor(Math.pow(2.0, 23.0) * (Mantissa % Math.pow(2.0, -15.0)));
  return output; //.multiplyScalar(1.0 / 255.0);
}

// function unpackFloat4(_packed: THREE.Vector4) {
//   const rgba = _packed.multiplyScalar(255.0);
//   const sign = (-rgba.y < -128.0 ? 0.0 : 1.0) * 2.0 - 1.0;
//   const exponent = rgba.x - 127.0;
//   if (Math.abs(exponent + 127.0) < 0.001) {
//     return 0.0;
//   }

//   const mantissa = (rgba.y % 128.0) * 65536.0 + rgba.z * 256.0 + rgba.w + 8388608.0; //8388608.0 == 0x800000
//   return sign * Math.pow(2.0, exponent - 23.0) * mantissa;
// }

export function createMaterials(
  treeIndexCount: number,
  renderMode: RenderMode,
  clippingPlanes: THREE.Plane[]
): Materials {
  const textureDims = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = textureDims.width * textureDims.height;
  const dataTextureSize = new THREE.Vector2(textureDims.width, textureDims.height);

  const colors = new Uint8Array(4 * textureElementCount);
  for (let i = 0; i < textureElementCount; i++) {
    colors[4 * i + 3] = 1;
  }
  const overrideColorPerTreeIndex = new THREE.DataTexture(colors, textureDims.width, textureDims.height);

  const identityMatrix = new Matrix4();

  identityMatrix.setPosition(0.0, 0.0, 5.0);
  identityMatrix.makeScale(2, 2, 2);
  //identityMatrix.makeRotationFromEuler(new Euler(90, 0, 0));

  const identityMatrixArray = identityMatrix.toArray();

  console.log(identityMatrixArray);

  const floats = new Uint8Array(16 * 4);

  for (let i = 0; i < identityMatrixArray.length; i++) {
    const element = packFloat(identityMatrixArray[i]);
    floats[i * 4] = element.x;
    floats[i * 4 + 1] = element.y;
    floats[i * 4 + 2] = element.z;
    floats[i * 4 + 3] = element.w;
  }

  const dynamicTransformationTexture = new THREE.DataTexture(floats, 16, 1);

  const matCapTexture = new THREE.Texture(matCapTextureImage);
  matCapTexture.needsUpdate = true;

  const boxMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Box)',
    clipping: true,
    clippingPlanes,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const circleMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Circle)',
    clipping: true,
    clippingPlanes,
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
    clippingPlanes,
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const quadMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Quads)',
    clipping: true,
    clippingPlanes,
    vertexShader: sectorShaders.quadPrimitive.vertex,
    fragmentShader: sectorShaders.quadPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const generalRingMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (General rings)',
    clipping: true,
    clippingPlanes,
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
    clippingPlanes,
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
    clippingPlanes,
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
    clippingPlanes,
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
    clippingPlanes,
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
    clippingPlanes,
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
    clippingPlanes,
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
    clippingPlanes,
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
    clippingPlanes,
    extensions: {
      derivatives: true
    },
    side: THREE.DoubleSide,
    fragmentShader: sectorShaders.detailedMesh.fragment,
    vertexShader: sectorShaders.detailedMesh.vertex
  });

  const instancedMeshMaterial = new THREE.ShaderMaterial({
    name: 'Instanced meshes',
    clipping: true,
    clippingPlanes,
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
    clippingPlanes,
    fragmentShader: sectorShaders.simpleMesh.fragment,
    vertexShader: sectorShaders.simpleMesh.vertex
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
      dynamicTransformationTexture,
      matCapTexture,
      renderMode
    );
  }

  return { ...allMaterials, overrideColorPerTreeIndex };
}

function updateDefinesAndUniforms(
  material: THREE.ShaderMaterial,
  dataTextureSize: THREE.Vector2,
  overrideColorPerTreeIndex: THREE.DataTexture,
  dynamicTransformationTexture: THREE.DataTexture,
  matCapTexture: THREE.Texture,
  renderMode: RenderMode
) {
  const test = packFloat(2.5);

  const oldUniforms = material.uniforms;
  material.setValues({
    ...shaderDefines,
    uniforms: {
      ...oldUniforms,
      renderMode: {
        value: renderMode
      },
      colorDataTexture: {
        value: overrideColorPerTreeIndex
      },
      dataTextureSize: {
        value: dataTextureSize
      },
      testArray: {
        value: [test.x, test.y, test.z, test.w]
      },
      testTexture: {
        value: dynamicTransformationTexture
      },
      matCapTexture: {
        value: matCapTexture
      }
    }
  });
}
