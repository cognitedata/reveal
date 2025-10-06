/*!
 * Copyright 2021 Cognite AS
 */

import glsl from 'glslify';

import meshFrag from '../glsl/sector/mesh.frag';
import meshVert from '../glsl/sector/mesh.vert';

import instancedMeshFrag from '../glsl/sector/instancedMesh.frag';
import instancedMeshVert from '../glsl/sector/instancedMesh.vert';

import boxFrag from '../glsl/sector/instancedMesh.frag';
import boxVert from '../glsl/sector/instancedMesh.vert';

import circleFrag from '../glsl/sector/primitives/circle.frag';
import circleVert from '../glsl/sector/primitives/circle.vert';

import coneFrag from '../glsl/sector/primitives/cone.frag';
import coneVert from '../glsl/sector/primitives/cone.vert';

import eccentricConeFrag from '../glsl/sector/primitives/eccentricCone.frag';
import eccentricConeVert from '../glsl/sector/primitives/eccentricCone.vert';

import ellipsoidSegmentFrag from '../glsl/sector/primitives/ellipsoidSegment.frag';
import ellipsoidSegmentVert from '../glsl/sector/primitives/ellipsoidSegment.vert';

import generalCylinderFrag from '../glsl/sector/primitives/generalCylinder.frag';
import generalCylinderVert from '../glsl/sector/primitives/generalCylinder.vert';

import generalRingFrag from '../glsl/sector/primitives/generalring.frag';
import generalRingVert from '../glsl/sector/primitives/generalring.vert';

import nutFrag from '../glsl/sector/instancedMesh.frag';
import nutVert from '../glsl/sector/instancedMesh.vert';

import quadFrag from '../glsl/sector/instancedMesh.frag';
import quadVert from '../glsl/sector/instancedMesh.vert';

import torusSegmentFrag from '../glsl/sector/primitives/torusSegment.frag';
import torusSegmentVert from '../glsl/sector/primitives/torusSegment.vert';

import trapeziumFrag from '../glsl/sector/primitives/trapezium.frag';
import trapeziumVert from '../glsl/sector/primitives/trapezium.vert';

import pointCloudNormalizeFrag from '../glsl/pointcloud/normalize.frag';
import pointCloudNormalizeVert from '../glsl/pointcloud/normalize.vert';

import pointCloudFrag from '../glsl/pointcloud/pointcloud.frag';
import pointCloudVert from '../glsl/pointcloud/pointcloud.vert';

import ssaoFrag from '../glsl/post-processing/pure-depth-ssao.frag';
import ssaoVert from '../glsl/post-processing/passthrough.vert';

import taaFrag from '../glsl/post-processing/taa.frag';
import taaVert from '../glsl/post-processing/taa.vert';

import blitFrag from '../glsl/post-processing/blit.frag';
import blitVert from '../glsl/post-processing/unit-orthographic-passthrough.vert';

import depthBlendFrag from '../glsl/post-processing/depthBlendBlit.frag';
import depthBlendVert from '../glsl/post-processing/unit-orthographic-passthrough.vert';

export const sectorShaders = {
  // ----------------
  // "Regular" meshes
  // ----------------
  detailedMesh: {
    fragment: glsl(meshFrag),
    vertex: glsl(meshVert)
  },
  instancedMesh: {
    fragment: glsl(instancedMeshFrag),
    vertex: glsl(instancedMeshVert)
  },

  // ----------------
  // Primitives
  // ----------------
  boxPrimitive: {
    fragment: glsl(boxFrag),
    vertex: glsl(boxVert)
  },
  circlePrimitive: {
    fragment: glsl(circleFrag),
    vertex: glsl(circleVert)
  },
  conePrimitive: {
    fragment: glsl(coneFrag),
    vertex: glsl(coneVert)
  },
  eccentricConePrimitive: {
    fragment: glsl(eccentricConeFrag),
    vertex: glsl(eccentricConeVert)
  },
  ellipsoidSegmentPrimitive: {
    fragment: glsl(ellipsoidSegmentFrag),
    vertex: glsl(ellipsoidSegmentVert)
  },
  generalCylinderPrimitive: {
    fragment: glsl(generalCylinderFrag),
    vertex: glsl(generalCylinderVert)
  },
  generalRingPrimitive: {
    fragment: glsl(generalRingFrag),
    vertex: glsl(generalRingVert)
  },
  nutPrimitive: {
    fragment: glsl(nutFrag),
    vertex: glsl(nutVert)
  },
  quadPrimitive: {
    fragment: glsl(quadFrag),
    vertex: glsl(quadVert)
  },
  torusSegmentPrimitive: {
    fragment: glsl(torusSegmentFrag),
    vertex: glsl(torusSegmentVert)
  },
  trapeziumPrimitive: {
    fragment: glsl(trapeziumFrag),
    vertex: glsl(trapeziumVert)
  }
};

/**
 * Point cloud shaders.
 */
export const pointCloudShaders = {
  normalize: {
    fragment: glsl(pointCloudNormalizeFrag),
    vertex: glsl(pointCloudNormalizeVert)
  },
  pointcloud: {
    fragment: glsl(pointCloudFrag),
    vertex: glsl(pointCloudVert)
  }
};

/**
 * Screen space ambient occlusion shader
 */
export const ssaoShaders = {
  fragment: glsl(ssaoFrag),
  vertex: glsl(ssaoVert)
};

/**
 * Temporal anti-aliasing shader
 */
export const taaShaders = {
  fragment: glsl(taaFrag),
  vertex: glsl(taaVert)
};

export const blitShaders = {
  fragment: glsl(blitFrag),
  vertex: glsl(blitVert)
};

export const depthBlendBlitShaders = {
  fragment: glsl(depthBlendFrag),
  vertex: glsl(depthBlendVert)
};
