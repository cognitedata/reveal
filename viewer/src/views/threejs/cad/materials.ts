/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { sectorShaders, shaderDefines } from './shaders';
import { RenderType } from '../materials';

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
}

export function createMaterials(): Materials {
  const boxMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Box)',
    ...shaderDefines,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    uniforms: {
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
      }
    }
  });

  const nutMaterial = new THREE.ShaderMaterial({
    name: 'Primitives (Nuts)',
    ...shaderDefines,
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment,
    uniforms: {
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
      renderType: {
        value: RenderType.Color
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
    triangleMesh: triangleMeshMaterial
  };
}
