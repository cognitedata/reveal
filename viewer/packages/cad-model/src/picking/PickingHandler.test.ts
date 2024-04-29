/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager } from '@reveal/rendering';
import { IntersectInput } from '@reveal/model-base';

import { PickingHandler } from './PickingHandler';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { createCadModel, autoMockWebGLRenderer } from '../../../../test-utilities';

describe(PickingHandler.name, () => {
  let pickingHandler: PickingHandler;

  const camera = new THREE.PerspectiveCamera();

  const renderer = autoMockWebGLRenderer(new Mock<THREE.WebGLRenderer>()).object();

  const input: IntersectInput = {
    normalizedCoords: new THREE.Vector2(0.5, 0.5),
    renderer,
    camera,
    clippingPlanes: [],
    domElement: document.createElement('canvas')
  };
  const cadNode = createCadModel(1, 2).cadNode;

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
});
