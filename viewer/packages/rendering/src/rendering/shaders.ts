/*!
 * Copyright 2021 Cognite AS
 */

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

import blitFrag from '../glsl/post-processing/blit.frag';
import blitVert from '../glsl/post-processing/unit-orthographic-passthrough.vert';

import depthBlendFrag from '../glsl/post-processing/depthBlendBlit.frag';
import depthBlendVert from '../glsl/post-processing/unit-orthographic-passthrough.vert';

type ShaderPair = {
  vertex: string;
  fragment: string;
};

type SectorShaders = {
  detailedMesh: ShaderPair;
  instancedMesh: ShaderPair;
  boxPrimitive: ShaderPair;
  circlePrimitive: ShaderPair;
  conePrimitive: ShaderPair;
  eccentricConePrimitive: ShaderPair;
  ellipsoidSegmentPrimitive: ShaderPair;
  generalCylinderPrimitive: ShaderPair;
  generalRingPrimitive: ShaderPair;
  nutPrimitive: ShaderPair;
  quadPrimitive: ShaderPair;
  torusSegmentPrimitive: ShaderPair;
  trapeziumPrimitive: ShaderPair;
};

export const sectorShaders: SectorShaders = {
  // ----------------
  // "Regular" meshes
  // ----------------
  detailedMesh: {
    fragment: meshFrag,
    vertex: meshVert
  },
  instancedMesh: {
    fragment: instancedMeshFrag,
    vertex: instancedMeshVert
  },

  // ----------------
  // Primitives
  // ----------------
  boxPrimitive: {
    fragment: boxFrag,
    vertex: boxVert
  },
  circlePrimitive: {
    fragment: circleFrag,
    vertex: circleVert
  },
  conePrimitive: {
    fragment: coneFrag,
    vertex: coneVert
  },
  eccentricConePrimitive: {
    fragment: eccentricConeFrag,
    vertex: eccentricConeVert
  },
  ellipsoidSegmentPrimitive: {
    fragment: ellipsoidSegmentFrag,
    vertex: ellipsoidSegmentVert
  },
  generalCylinderPrimitive: {
    fragment: generalCylinderFrag,
    vertex: generalCylinderVert
  },
  generalRingPrimitive: {
    fragment: generalRingFrag,
    vertex: generalRingVert
  },
  nutPrimitive: {
    fragment: nutFrag,
    vertex: nutVert
  },
  quadPrimitive: {
    fragment: quadFrag,
    vertex: quadVert
  },
  torusSegmentPrimitive: {
    fragment: torusSegmentFrag,
    vertex: torusSegmentVert
  },
  trapeziumPrimitive: {
    fragment: trapeziumFrag,
    vertex: trapeziumVert
  }
};

/**
 * Point cloud shaders.
 */

type PointCloudShaders = {
  normalize: ShaderPair;
  pointcloud: ShaderPair;
};

export const pointCloudShaders: PointCloudShaders = {
  normalize: {
    fragment: pointCloudNormalizeFrag,
    vertex: pointCloudNormalizeVert
  },
  pointcloud: {
    fragment: pointCloudFrag,
    vertex: pointCloudVert
  }
};

/**
 * Screen space ambient occlusion shader
 */
export const ssaoShaders: ShaderPair = {
  fragment: ssaoFrag,
  vertex: ssaoVert
};

export const blitShaders: ShaderPair = {
  fragment: blitFrag,
  vertex: blitVert
};

export const depthBlendBlitShaders: ShaderPair = {
  fragment: depthBlendFrag,
  vertex: depthBlendVert
};
