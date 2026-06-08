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

export const sectorShaders: {
    // ----------------
    // "Regular" meshes
    // ----------------
    detailedMesh: {
        fragment: string;
        vertex: string;
    }; instancedMesh: {
        fragment: string;
        vertex: string;
    };
    // ----------------
    // Primitives
    // ----------------
    boxPrimitive: {
        fragment: string;
        vertex: string;
    }; circlePrimitive: {
        fragment: string;
        vertex: string;
    }; conePrimitive: {
        fragment: string;
        vertex: string;
    }; eccentricConePrimitive: {
        fragment: string;
        vertex: string;
    }; ellipsoidSegmentPrimitive: {
        fragment: string;
        vertex: string;
    }; generalCylinderPrimitive: {
        fragment: string;
        vertex: string;
    }; generalRingPrimitive: {
        fragment: string;
        vertex: string;
    }; nutPrimitive: {
        fragment: string;
        vertex: string;
    }; quadPrimitive: {
        fragment: string;
        vertex: string;
    }; torusSegmentPrimitive: {
        fragment: string;
        vertex: string;
    }; trapeziumPrimitive: {
        fragment: string;
        vertex: string;
    };
} = {
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
export const pointCloudShaders: {
    normalize: {
        fragment: string;
        vertex: string;
    };
    pointcloud: {
        fragment: string;
        vertex: string;
    };
} = {
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
export const ssaoShaders: {
    fragment: string;
    vertex: string;
} = {
  fragment: ssaoFrag,
  vertex: ssaoVert
};

export const blitShaders: {
    fragment: string;
    vertex: string;
} = {
  fragment: blitFrag,
  vertex: blitVert
};

export const depthBlendBlitShaders: {
    fragment: string;
    vertex: string;
} = {
  fragment: depthBlendFrag,
  vertex: depthBlendVert
};
