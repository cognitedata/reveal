/*!
 * Copyright 2024 Cognite AS
 */
import * as THREE from 'three';
import { Mock } from 'moq.ts';
import { jest } from '@jest/globals';

import { PointCloudPickingHandler } from './PointCloudPickingHandler';
import { PointCloudOctreePicker } from './potree-three-loader';
import { IntersectInput } from '@reveal/model-base';
import { createPointCloudNode } from '../../../test-utilities';

function createMockIntersectInput(): IntersectInput {
  return {
    normalizedCoords: new THREE.Vector2(0, 0),
    camera: new THREE.PerspectiveCamera(),
    clippingPlanes: [],
    renderer: new Mock<THREE.WebGLRenderer>().object(),
    domElement: document.createElement('div')
  };
}

describe(PointCloudPickingHandler.name, () => {
  let handler: PointCloudPickingHandler;

  beforeEach(() => {
    const renderer = new Mock<THREE.WebGLRenderer>().object();
    handler = new PointCloudPickingHandler(renderer);
    jest.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('intersectPointClouds returns empty array when no nodes are provided', async () => {
    const result = await handler.intersectPointClouds([], createMockIntersectInput());

    expect(result).toEqual([]);
  });

  test('intersectPointClouds returns empty array when all nodes are invisible', async () => {
    const node = createPointCloudNode();
    node.visible = false;

    const result = await handler.intersectPointClouds([node], createMockIntersectInput());

    expect(result).toEqual([]);
  });

  test('intersectPointClouds returns empty array when picker finds no intersection', async () => {
    const node = createPointCloudNode();

    const result = await handler.intersectPointClouds([node], createMockIntersectInput());

    expect(result).toEqual([]);
  });

  test('intersectPointClouds serializes concurrent picks', async () => {
    const node = createPointCloudNode();
    const input = createMockIntersectInput();

    const executionOrder: string[] = [];
    let firstResolve!: () => void;
    const firstBlocker = new Promise<void>(resolve => {
      firstResolve = resolve;
    });

    let callIndex = 0;
    jest.spyOn(PointCloudOctreePicker.prototype, 'pick').mockImplementation(async () => {
      const thisCall = ++callIndex;
      executionOrder.push(`pick_start_${thisCall}`);
      if (thisCall === 1) {
        await firstBlocker;
      }
      executionOrder.push(`pick_end_${thisCall}`);
      return null;
    });

    const first = handler.intersectPointClouds([node], input);
    const second = handler.intersectPointClouds([node], input);

    // Unblock first pick and wait for both to complete
    firstResolve();
    await first;
    await second;

    // Verify serial execution: first pick fully completed before second started
    expect(executionOrder).toEqual(['pick_start_1', 'pick_end_1', 'pick_start_2', 'pick_end_2']);
  });
});
