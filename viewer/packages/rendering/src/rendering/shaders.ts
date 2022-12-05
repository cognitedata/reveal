/*!
 * Copyright 2021 Cognite AS
 */

import glsl from 'glslify';

import sectorShaderSimpleMeshFrag from '../glsl/sector/simple.frag';
import sectorShaderSimpleMeshVert from '../glsl/sector/simple.vert';

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
    // fragment: glsl(sectorShaderSimpleMeshFrag.default),
    fragment: glsl(sectorShaderSimpleMeshFrag.default /* (await import('../glsl/sector/mesh.frag')).default.default */),
    vertex: glsl(sectorShaderSimpleMeshVert.default)
    // fragment: glsl(await fetch('../glsl/sector/simple.frag').then(p => p.text())),
    // vertex: glsl(await fetch('../glsl/sector/simple.vert').then(p => p.text()))
  },
  detailedMesh: {
    fragment: glsl(await fetch('../glsl/sector/mesh.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/mesh.vert').then(p => p.text()))
  },
  instancedMesh: {
    fragment: glsl(await fetch('../glsl/sector/instancedMesh.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/instancedMesh.vert').then(p => p.text()))
  },

  // ----------------
  // Primitives
  // ----------------
  boxPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/instancedMesh.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/instancedMesh.vert').then(p => p.text()))
  },
  circlePrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/circle.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/circle.vert').then(p => p.text()))
  },
  conePrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/cone.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/cone.vert').then(p => p.text()))
  },
  eccentricConePrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/eccentricCone.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/eccentricCone.vert').then(p => p.text()))
  },
  ellipsoidSegmentPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/ellipsoidSegment.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/ellipsoidSegment.vert').then(p => p.text()))
  },
  generalCylinderPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/generalCylinder.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/generalCylinder.vert').then(p => p.text()))
  },
  generalRingPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/generalring.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/generalring.vert').then(p => p.text()))
  },
  nutPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/instancedMesh.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/instancedMesh.vert').then(p => p.text()))
  },
  quadPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/instancedMesh.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/instancedMesh.vert').then(p => p.text()))
  },
  torusSegmentPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/torusSegment.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/torusSegment.vert').then(p => p.text()))
  },
  trapeziumPrimitive: {
    fragment: glsl(await fetch('../glsl/sector/primitives/trapezium.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/sector/primitives/trapezium.vert').then(p => p.text()))
  }
};

/**
 * Point cloud shaders.
 */
export const pointCloudShaders = {
  normalize: {
    fragment: glsl(await fetch('../glsl/pointcloud/normalize.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/pointcloud/normalize.vert').then(p => p.text()))
  },
  pointcloud: {
    fragment: glsl(await fetch('../glsl/pointcloud/pointcloud.frag').then(p => p.text())),
    vertex: glsl(await fetch('../glsl/pointcloud/pointcloud.vert').then(p => p.text()))
  }
};

/**
 * Screen space ambient occlusion shader
 */
export const ssaoShaders = {
  fragment: glsl(await fetch('../glsl/post-processing/pure-depth-ssao.frag').then(p => p.text())),
  vertex: glsl(await fetch('../glsl/post-processing/passthrough.vert').then(p => p.text()))
};

export const blitShaders = {
  fragment: glsl(await fetch('../glsl/post-processing/blit.frag').then(p => p.text())),
  vertex: glsl(await fetch('../glsl/post-processing/unit-orthographic-passthrough.vert').then(p => p.text()))
};

export const depthBlendBlitShaders = {
  fragment: glsl(await fetch('../glsl/post-processing/depthBlendBlit.frag').then(p => p.text())),
  vertex: glsl(await fetch('../glsl/post-processing/unit-orthographic-passthrough.vert').then(p => p.text()))
};

/**
 * Shaders use to estimate how many pixels a sector covers on screen.
 */
export const coverageShaders = {
  fragment: glsl(await fetch('../glsl/sector/sectorCoverage.frag').then(p => p.text())),
  vertex: glsl(await fetch('../glsl/sector/sectorCoverage.vert').then(p => p.text()))
};
