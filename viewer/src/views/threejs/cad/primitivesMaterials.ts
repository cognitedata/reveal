/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { sectorShaders, shaderDefines } from './shaders';
import { RenderType } from '../materials';

export const boxMaterial = new THREE.ShaderMaterial({
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

export const circleMaterial = new THREE.ShaderMaterial({
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

export const nutsMaterial = new THREE.ShaderMaterial({
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

export const quadsMaterial = new THREE.ShaderMaterial({
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

const generalRingsMaterialTemplate = new THREE.ShaderMaterial({
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

export function createGeneralRingsMaterial() {
  return generalRingsMaterialTemplate.clone();
}

const coneMaterialTemplate = new THREE.ShaderMaterial({
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

export function createConeMaterial() {
  return coneMaterialTemplate.clone();
}

const eccentricConesMaterialTemplate = new THREE.ShaderMaterial({
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

export function createEccentricConesMaterial() {
  return eccentricConesMaterialTemplate.clone();
}

const ellipsoidSegmentsMaterialTemplate = new THREE.ShaderMaterial({
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

export function createEllipsoidSegmentsMaterial() {
  return ellipsoidSegmentsMaterialTemplate.clone();
}

const generalCylinderMaterialTemplate = new THREE.ShaderMaterial({
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

export function createGeneralCylinderMaterial() {
  return generalCylinderMaterialTemplate.clone();
}

const trapeziumsMaterialTemplate = new THREE.ShaderMaterial({
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

export function createTrapeziumsMaterial() {
  return trapeziumsMaterialTemplate.clone();
}

const torusSegmentsMaterialTemplate = new THREE.ShaderMaterial({
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
  extensions: { fragDepth: true },
  vertexShader: sectorShaders.torusSegmentPrimitive.vertex,
  fragmentShader: sectorShaders.torusSegmentPrimitive.fragment,
  // TODO we can drop the double sided rendering if we add end caps
  side: THREE.DoubleSide
});

export function createTorusSegmentsMaterial() {
  return torusSegmentsMaterialTemplate.clone();
}

const sphericalSegmentsMaterialTemplate = new THREE.ShaderMaterial({
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

export function createSphericalSegmentsMaterial() {
  return sphericalSegmentsMaterialTemplate.clone();
}
