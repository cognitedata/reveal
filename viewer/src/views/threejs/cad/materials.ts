/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { sectorShaders, shaderDefines } from './shaders';
import { RenderMode } from '../materials';

export interface Materials {
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
}

export function createMaterials(): Materials {
  const pixelCount = 2048;
  const colorCount = pixelCount * pixelCount;

  const colors = new Uint8Array(4 * colorCount);
  const colorDataTexture = new THREE.DataTexture(colors, pixelCount, pixelCount);

  // const commonUniforms = {
  // renderMode: {
  // value: RenderMode.Color
  // },
  // colorDataTexture: {
  // value: colorDataTexture
  // }
  // };

  for (let i = 0; i < colorCount; i++) {
    colorDataTexture.image.data[4 * i] = 255;
    colorDataTexture.image.data[4 * i + 1] = 128;
    colorDataTexture.image.data[4 * i + 2] = 64;
    colorDataTexture.image.data[4 * i + 3] = 255;
  }

  const boxMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Box)',
    ...shaderDefines,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    uniforms: {
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    }
  });

  const circleMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Circle)',
    ...shaderDefines,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.circlePrimitive.vertex,
    fragmentShader: sectorShaders.circlePrimitive.fragment,
    // TODO double side is not necessary for all,
    // we should indicate this in the data from Rust
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    }
  });

  const nutMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Nuts)',
    ...shaderDefines,
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment,
    uniforms: {
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    }
  });

  const quadMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Quads)',
    ...shaderDefines,
    vertexShader: sectorShaders.quadPrimitive.vertex,
    fragmentShader: sectorShaders.quadPrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    }
  });

  const generalRingMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (General rings)',
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
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
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.conePrimitive.vertex,
    fragmentShader: sectorShaders.conePrimitive.fragment
  });

  const eccentricConeMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Eccentric cone)',
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.eccentricConePrimitive.vertex,
    fragmentShader: sectorShaders.eccentricConePrimitive.fragment
  });

  const ellipsoidSegmentMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Ellipsoid segments)',
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment
  });

  const generalCylinderMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (General cylinder)',
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.generalCylinderPrimitive.vertex,
    fragmentShader: sectorShaders.generalCylinderPrimitive.fragment
  });

  const trapeziumMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Trapezium)',
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.trapeziumPrimitive.vertex,
    fragmentShader: sectorShaders.trapeziumPrimitive.fragment
  });

  const torusSegmentMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Torus segment)',
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
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
    ...shaderDefines,
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment
  });

  const triangleMeshMaterial = new THREE.ShaderMaterial({
    name: 'Triangle meshes',
    ...shaderDefines,
    extensions: {
      derivatives: true
    },
    side: THREE.DoubleSide,
    fragmentShader: sectorShaders.detailedMesh.fragment,
    vertexShader: sectorShaders.detailedMesh.vertex,
    uniforms: {
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    }
  });

  const instancedMeshMaterial = new THREE.ShaderMaterial({
    name: 'Instanced meshes',
    ...shaderDefines,
    extensions: {
      derivatives: true
    },
    side: THREE.DoubleSide,
    fragmentShader: sectorShaders.instancedMesh.fragment,
    vertexShader: sectorShaders.instancedMesh.vertex,
    uniforms: {
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    }
  });

  const simpleMaterial = new THREE.ShaderMaterial({
    name: 'Low detail material',
    ...shaderDefines,
    fragmentShader: sectorShaders.simpleMesh.fragment,
    vertexShader: sectorShaders.simpleMesh.vertex,
    uniforms: {
      renderMode: {
        value: RenderMode.Color
      },
      colorDataTexture: {
        value: colorDataTexture
      }
    }
  });

  return {
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
}
