/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager } from '@reveal/rendering';
import { IntersectInput } from '@reveal/model-base';

import { createGlContext } from '../../../../test-utilities';
import { PickingHandler } from './PickingHandler';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { CadNode } from '../wrappers/CadNode';

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
    const materialManagerMock = new Mock<CadMaterialManager>().setup(p => p.setRenderMode(It.IsAny())).returns();
    pickingHandler = new PickingHandler(renderer, materialManagerMock.object(), new SceneHandler());
  });

  test('no nodes, returns empty array', async () => {
    const intersections = await pickingHandler.intersectCadNodes([], input);
    expect(intersections).toBeEmpty();
  });

  test('single node that does not intersect, returns empty array', async () => {
    const intersections = await pickingHandler.intersectCadNodes([cadNode], input);
    expect(intersections).toBeEmpty();
  });

  test('resets render state before results are returned and after results are ready', async () => {
    renderer.setClearAlpha(0.5);
    renderer.setClearColor(new THREE.Color(0.5, 0.6, 0.7));
    const promise = pickingHandler.intersectCadNodes([cadNode], input);
    expect(renderer.getClearAlpha()).toEqual(0.5);
    expect(renderer.getClearColor(new THREE.Color())).toEqual(new THREE.Color(0.5, 0.6, 0.7));
    await promise;
    expect(renderer.getClearAlpha()).toEqual(0.5);
    expect(renderer.getClearColor(new THREE.Color())).toEqual(new THREE.Color(0.5, 0.6, 0.7));
  });
});
