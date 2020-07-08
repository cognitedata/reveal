/*!
 * Copyright 2020 Cognite AS
 */

import glsl from 'glslify';

/**
 * Defines used to enable debugging features in shaders.
 */
export const shaderDefines = {
  defines: {
    // Color geometry by tree index instead of model colors.
    COGNITE_COLOR_BY_TREE_INDEX: false
  }
};

export const sectorShaders = {
  // ----------------
  // "Regular" meshes
  // ----------------
  simpleMesh: {
    fragment: glsl(require('@/glsl/sector/simple.frag').default),
    vertex: glsl(require('@/glsl/sector/simple.vert').default)
  },
  detailedMesh: {
    fragment: glsl(require('@/glsl/sector/mesh.frag').default),
    vertex: glsl(require('@/glsl/sector/mesh.vert').default)
  },
  instancedMesh: {
    fragment: glsl(require('@/glsl/sector/instancedMesh.frag').default),
    vertex: glsl(require('@/glsl/sector/instancedMesh.vert').default)
  },

  // ----------------
  // Primitives
  // ----------------
  boxPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/instanced.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/instanced.vert').default)
  },
  circlePrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/circle.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/circle.vert').default)
  },
  conePrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/cone.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/cone.vert').default)
  },
  eccentricConePrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/eccentricCone.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/eccentricCone.vert').default)
  },
  ellipsoidSegmentPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/ellipsoidSegment.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/ellipsoidSegment.vert').default)
  },
  generalCylinderPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/generalCylinder.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/generalCylinder.vert').default)
  },
  generalRingPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/generalring.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/generalring.vert').default)
  },
  nutPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/instanced.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/instanced.vert').default)
  },
  quadPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/instanced.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/instanced.vert').default)
  },
  torusSegmentPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/torusSegment.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/torusSegment.vert').default)
  },
  trapeziumPrimitive: {
    fragment: glsl(require('@/glsl/sector/primitives/trapezium.frag').default),
    vertex: glsl(require('@/glsl/sector/primitives/trapezium.vert').default)
  }
};

export const edgeDetectionShaders = {
  combine: glsl(require('@/glsl/post-processing/edge-detect-combine.frag').default),
  vertex: glsl(require('@/glsl/post-processing/edge-detection.vert').default)
};

/**
 * Shaders use to estimate how many pixels a sector covers on screen.
 */
export const coverageShaders = {
  fragment: glsl(require('@/glsl/sector/sectorCoverage.frag').default),
  vertex: glsl(require('@/glsl/sector/sectorCoverage.vert').default)
};
