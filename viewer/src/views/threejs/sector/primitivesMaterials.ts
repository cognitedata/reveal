/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { sectorShaders } from './shaders';

export const boxMaterial = new THREE.ShaderMaterial({
  extensions: { fragDepth: true },
  vertexShader: sectorShaders.boxPrimitive.vertex,
  fragmentShader: sectorShaders.boxPrimitive.fragment
});

export const circleMaterial = new THREE.ShaderMaterial({
  extensions: { fragDepth: true },
  vertexShader: sectorShaders.circlePrimitive.vertex,
  fragmentShader: sectorShaders.circlePrimitive.fragment,
  // TODO double side is not necessary for all,
  // we should indicate this in the data from Rust
  side: THREE.DoubleSide
});

export const nutsMaterial = new THREE.ShaderMaterial({
  vertexShader: sectorShaders.nutPrimitive.vertex,
  fragmentShader: sectorShaders.nutPrimitive.fragment
});

export const quadsMaterial = new THREE.ShaderMaterial({
  vertexShader: sectorShaders.quadPrimitive.vertex,
  fragmentShader: sectorShaders.quadPrimitive.fragment,
  side: THREE.DoubleSide
});

const generalRingsMaterialTemplate = new THREE.ShaderMaterial({
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

export function createGeneralRingsMaterial() {
  return generalRingsMaterialTemplate.clone();
}

const coneMaterialTemplate = new THREE.ShaderMaterial({
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
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
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
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
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
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
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
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
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
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
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
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
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
    }
  },
  extensions: { fragDepth: true },
  vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
  fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment
});

export function createSphericalSegmentsMaterial() {
  return sphericalSegmentsMaterialTemplate.clone();
}

const sphericalSegementsMaterialTemplate = new THREE.ShaderMaterial({
  uniforms: {
    inverseModelMatrix: {
      value: new THREE.Matrix4()
    }
  },
  extensions: { fragDepth: true },
  vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
  fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment
});

export function createSphericalSegementsMaterial() {
  return sphericalSegementsMaterialTemplate.clone();
}
