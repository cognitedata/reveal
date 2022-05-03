/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from '@reveal/rendering';
import { IntersectInput } from '@reveal/model-base';

import { createGlContext } from '../../../test-utilities';
import { PickingHandler } from './PickingHandler';

describe(PickingHandler.name, () => {
  let pickingHandler: PickingHandler;

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

  beforeEach(() => {
    pickingHandler = new PickingHandler();
  });

  test('no nodes, returns empty array', () => {
    const intersections = pickingHandler.intersectCadNodes([], input);
    expect(intersections).toBeEmpty();
  });

  test('single node that does not intersect, returns empty array', () => {
    const intersections = pickingHandler.intersectCadNodes([cadNode], input);
    expect(intersections).toBeEmpty();
  });
});
