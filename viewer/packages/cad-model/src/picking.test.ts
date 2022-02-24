/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from '@reveal/rendering';
import { IntersectInput } from '@reveal/model-base';

import { intersectCadNodes } from './picking';
import { createGlContext } from '../../../test-utilities';

describe('intersectCadNodes', () => {
  const camera = new THREE.PerspectiveCamera();

  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });

  const input: IntersectInput = {
    normalizedCoords: {
      x: 0.5,
      y: 0.5
    },
    renderer,
    camera,
    clippingPlanes: [],
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
