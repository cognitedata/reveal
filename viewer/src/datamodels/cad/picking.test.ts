/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { intersectCadNodes } from './picking';
import { CadNode } from './CadNode';
import { IntersectInput } from '../base/types';

describe('intersectCadNodes', () => {
  const camera = new THREE.PerspectiveCamera();

  const context: WebGLRenderingContext = require('gl')(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  const input: IntersectInput = {
    normalizedCoords: {
      x: 0.5,
      y: 0.5
    },
    renderer,
    camera,
    domElement: document.createElement('canvas')
  };
  const cadNode: CadNode = new THREE.Object3D() as any;

  test('no nodes, returns empty array', () => {
    const intersections = intersectCadNodes([], input);
    expect(intersections).toBeEmpty();
  });

  test('single node that does not intersect, returns empty array', () => {
    const intersections = intersectCadNodes([cadNode], input);
    expect(intersections).toBeEmpty();
  });
});
