/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { intersectCadNodes } from '@/dataModels/cad/internal/picking';
import { CadNode } from '@/dataModels/cad/internal/CadNode';

describe('intersectCadNodes', () => {
  const camera = new THREE.PerspectiveCamera();
  const renderer: THREE.WebGLRenderer = {
    domElement: document.createElement('canvas'),
    setClearColor: jest.fn(),
    getClearColor: () => new THREE.Color(),
    getClearAlpha: () => 1.0,
    clearColor: jest.fn(),
    setRenderTarget: jest.fn(),
    render: jest.fn(),
    readRenderTargetPixels: jest.fn()
  } as any;
  const input = {
    coords: {
      x: 0.5,
      y: 0.5
    },
    renderer,
    camera
  };
  const cadNode: CadNode = {
    add: jest.fn()
  } as any;

  test('no nodes, returns empty array', () => {
    const intersections = intersectCadNodes([], input);
    expect(intersections).toBeEmpty();
  });

  test('single node that does not intersect, returns empty array', () => {
    const intersections = intersectCadNodes([cadNode], input);
    expect(intersections).toBeEmpty();
  });
});
