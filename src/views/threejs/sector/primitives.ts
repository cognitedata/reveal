/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { PrimitiveAttributes } from '../../../../workers/types/parser.types';
import { sectorShaders } from './shaders';
import { Sector } from '../../../models/sector/types';

export function* createPrimitives(sector: Sector) {
  yield createBoxes(sector.boxes);
  yield createCircles(sector.circles);
  yield createCones(sector.cones);
  yield createEccentricCones(sector.eccentricCones);
  yield createEllipsoidSegments(sector.ellipsoidSegments);
  yield createGeneralCylinders(sector.generalCylinders);
  yield createGeneralRings(sector.generalRings);
  yield createQuads(sector.quads);
  yield createSphericalSegments(sector.sphericalSegments);
  yield createTorusSegments(sector.torusSegments);
  yield createTrapeziums(sector.trapeziums);
  yield createNuts(sector.nuts);
}

/**
 * Generate a three-dimensional plane geometry, with an optional applied tranformation function
 *   (u, v) => [ x, y, z ]
 */
function generatePlane3D(
  segmentsX: number,
  segmentsY: number,
  transformFunc: (u: number, v: number) => number[] = (u, v) => [u, v, 0]
) {
  const vertices = [];
  const indices = [];

  const segmentsXInv = 1 / segmentsX;
  const segmentsYInv = 1 / segmentsY;
  for (let j = 0; j <= segmentsY; j++) {
    for (let i = 0; i <= segmentsX; i++) {
      // vertices
      const [x, y, z] = transformFunc(i * segmentsXInv, j * segmentsYInv);
      vertices.push(x || 0, y || 0, z || 0);
    }
  }

  for (let j = 1; j <= segmentsY; j++) {
    for (let i = 1; i <= segmentsX; i++) {
      // indices
      const a = (segmentsX + 1) * j + i - 1;
      const b = (segmentsX + 1) * (j - 1) + i - 1;
      const c = (segmentsX + 1) * (j - 1) + i;
      const d = (segmentsX + 1) * j + i;

      // faces
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return {
    index: new THREE.Uint16BufferAttribute(indices, 1),
    position: new THREE.Float32BufferAttribute(vertices, 3)
  };
}

const boxGeometry = (() => {
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1);
  const result = {
    index: geometry.getIndex(),
    position: geometry.getAttribute('position'),
    normal: geometry.getAttribute('normal')
  };
  geometry.dispose();
  return result;
})();

const quadGeometry = (() => {
  const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  const result = {
    index: geometry.getIndex(),
    position: geometry.getAttribute('position'),
    normal: geometry.getAttribute('normal')
  };
  geometry.dispose();
  return result;
})();

const trapeziumGeometry = (() => {
  const index = [0, 1, 3, 0, 3, 2];
  const position = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
  return {
    index: new THREE.BufferAttribute(new Uint16Array(index), 1),
    position: new THREE.BufferAttribute(new Float32Array(position), 3)
  };
})();

// cone
const coneGeometry = (() => {
  const positions = [];
  positions.push(-1, 1, -1);
  positions.push(-1, -1, -1);
  positions.push(1, 1, -1);
  positions.push(1, -1, -1);
  positions.push(1, 1, 1);
  positions.push(1, -1, 1);

  const indices = new Uint16Array([1, 2, 0, 1, 3, 2, 3, 4, 2, 3, 5, 4]);
  return {
    index: new THREE.BufferAttribute(indices, 1),
    position: new THREE.BufferAttribute(new Float32Array(positions), 3)
  };
})();

const torusLODs = (() => {
  const parameters = [
    [6, 4],
    [9, 4],
    [11, 6],
    [16, 12],
    [24, 16]
  ];
  const transformFunc = (u: number, v: number) => [u, v * 2.0 * Math.PI];
  return parameters.map(([radialSegments, tubularSegments]) =>
    generatePlane3D(radialSegments, tubularSegments, transformFunc)
  );
})();

const nutGeometry = (() => {
  // in order to further optimize 3d-viewer, we can make our own nut mesh
  // that way, we can reduce 4 more triangles
  // the problem is with the normals, because to do flat shading, we have to duplicate normals
  // one way to improve it is to use 'flat' qualifier to stop glsl from interpolating normals
  const geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 1, 6);
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  const result = {
    index: geometry.getIndex(),
    position: geometry.getAttribute('position'),
    normal: geometry.getAttribute('normal')
  };
  geometry.dispose();
  return result;
})();

function setAttributes(geometry: THREE.InstancedBufferGeometry, attributes: PrimitiveAttributes) {
  // TODO u8Attributes should probably be renamed to colorAttributes or similar
  // TODO should be enough with 3 elements for color instead of 4
  for (const [name, value] of attributes.u8Attributes) {
    const itemSize = 4;
    // We assume uint8 data is color and that it always is normalized. For now this is probably ok.
    // See comment above
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize, true));
  }
  for (const [name, value] of attributes.f32Attributes) {
    const itemSize = 1;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize));
  }
  for (const [name, value] of attributes.vec3Attributes) {
    const itemSize = 3;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize));
  }
  for (const [name, value] of attributes.vec4Attributes) {
    const itemSize = 4;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize));
  }
  for (const [name, value] of attributes.mat4Attributes) {
    const buffer = new THREE.InstancedInterleavedBuffer(value, 16);
    for (let column = 0; column < 4; column++) {
      const attribute = new THREE.InterleavedBufferAttribute(buffer, 4, column * 4);
      geometry.setAttribute(`a_${name}_column_${column}`, attribute);
    }
  }
  for (const [name, value] of attributes.f64Attributes) {
    // TODO consider passing this properly from Rust instead
    const float32Value = new Float32Array(value);
    const itemSize = 1;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(float32Value, itemSize));
  }
  const nodeIds = attributes.f64Attributes.get('nodeId');
  if (!nodeIds) {
    throw new Error('nodeId not present in f64Attributes');
  }
  geometry.maxInstancedCount = nodeIds.length;
}

function createBoxes(boxes: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(boxGeometry.index);
  geometry.setAttribute('position', boxGeometry.position);
  geometry.setAttribute('normal', boxGeometry.normal);

  setAttributes(geometry, boxes);

  const material = new THREE.ShaderMaterial({
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment
  });

  // TODO add frustum culling back for all meshes after adding proper boudning boxes
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.name = `Boxes`;
  return mesh;
}

function createCircles(circles: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.position);

  setAttributes(geometry, circles);

  const material = new THREE.ShaderMaterial({
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.circlePrimitive.vertex,
    fragmentShader: sectorShaders.circlePrimitive.fragment,
    // TODO double side is not necessary for all,
    // we should indicate this in the data from Rust
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.name = `Circles`;
  return mesh;
}

function createCones(cones: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);

  setAttributes(geometry, cones);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.conePrimitive.vertex,
    fragmentShader: sectorShaders.conePrimitive.fragment
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
    material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
  };

  mesh.name = `Cones`;
  return mesh;
}

function createEccentricCones(eccentricCones: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);

  setAttributes(geometry, eccentricCones);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.eccentricConePrimitive.vertex,
    fragmentShader: sectorShaders.eccentricConePrimitive.fragment
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
    material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
  };

  mesh.name = `EccentricCones`;
  return mesh;
}

function createEllipsoidSegments(ellipsoidSegments: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);

  setAttributes(geometry, ellipsoidSegments);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
    material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
  };

  mesh.name = `EllipsoidSegments`;
  return mesh;
}

function createGeneralCylinders(generalCylinders: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);

  setAttributes(geometry, generalCylinders);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.generalCylinderPrimitive.vertex,
    fragmentShader: sectorShaders.generalCylinderPrimitive.fragment
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
    material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
  };

  mesh.name = `GeneralCylinders`;
  return mesh;
}

function createGeneralRings(generalRings: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);

  setAttributes(geometry, generalRings);

  const material = new THREE.ShaderMaterial({
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

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
    material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
  };

  mesh.name = `GeneralRings`;
  return mesh;
}

function createSphericalSegments(sphericalSegments: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);

  setAttributes(geometry, sphericalSegments);

  const radii = sphericalSegments.f32Attributes.get('radius');
  if (!radii) {
    throw new Error('Spherical segments missing radius');
  }
  // TODO We need to set the radii manually here because
  // we are reusing the ellipsoid shader. We should
  // consider making this cleaner - either by duplicating
  // this data from Rust or by creating a separate shader for
  // spherical segments
  geometry.setAttribute(`a_horizontalRadius`, new THREE.InstancedBufferAttribute(radii, 1));
  geometry.setAttribute(`a_verticalRadius`, new THREE.InstancedBufferAttribute(radii, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
    material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
  };

  mesh.name = `EllipsoidSegments`;
  return mesh;
}

function createQuads(quads: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.normal);

  setAttributes(geometry, quads);

  const material = new THREE.ShaderMaterial({
    vertexShader: sectorShaders.quadPrimitive.vertex,
    fragmentShader: sectorShaders.quadPrimitive.fragment,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.name = `Quads`;
  return mesh;
}

function createTrapeziums(trapeziums: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(trapeziumGeometry.index);
  geometry.setAttribute('position', trapeziumGeometry.position);

  setAttributes(geometry, trapeziums);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.trapeziumPrimitive.vertex,
    fragmentShader: sectorShaders.trapeziumPrimitive.fragment
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
    material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
  };

  mesh.name = `Trapeziums`;
  return mesh;
}

function calcLODDistance(size: number, lodLevel: number, numLevels: number): number {
  if (lodLevel >= numLevels - 1) {
    return 0;
  }
  const scaleFactor = 15; // Seems to be a reasonable number
  return size * scaleFactor ** (numLevels - 1 - lodLevel);
}

function createTorusSegments(torusSegments: PrimitiveAttributes) {
  const material = new THREE.ShaderMaterial({
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

  const sizes = torusSegments.f32Attributes.get('size');
  if (!sizes) {
    throw new Error('Torus segments are missing size attribute');
  }
  const biggestTorus = sizes.reduce((acc, size) => Math.max(acc, size));
  const lod = new THREE.LOD();

  for (const [level, torus] of torusLODs.entries()) {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setIndex(torus.index);
    geometry.setAttribute('position', torus.position);
    setAttributes(geometry, torusSegments);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;

    // TODO consider removing if not used in shader
    mesh.onBeforeRender = (_renderer, _scene, _camera, _geometry, _material, _group) => {
      material.uniforms.inverseModelMatrix.value.getInverse(mesh.matrixWorld);
    };

    mesh.name = `TorusSegments`;

    lod.addLevel(mesh, calcLODDistance(biggestTorus, level, torusLODs.length));
  }

  return lod;
}

function createNuts(nuts: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(nutGeometry.index);
  geometry.setAttribute('position', nutGeometry.position);
  geometry.setAttribute('normal', nutGeometry.normal);

  setAttributes(geometry, nuts);

  const material = new THREE.ShaderMaterial({
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.name = `Nuts`;
  return mesh;
}
