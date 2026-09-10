/*!
 * Copyright 2024 Cognite AS
 */
import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Plane, Vector2, Vector3 } from 'three';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';

import { PointCloudPickingHandler } from './PointCloudPickingHandler';
import { PointCloudOctreePicker } from './potree-three-loader';
import type { IntersectInput } from '@reveal/model-base';
import { createPointCloudNode } from '../../../test-utilities';
import type { ClassicDataSourceType, DMDataSourceType } from '@reveal/data-providers';
import type { PointCloudObject } from '@reveal/data-providers';
import { Cylinder } from '@reveal/utilities';
import { assert } from '@reveal/utilities/assert';

function createMockIntersectInput(): IntersectInput {
  return {
    normalizedCoords: new Vector2(0, 0),
    camera: new PerspectiveCamera(),
    clippingPlanes: [],
    renderer: new Mock<WebGLRenderer>().object(),
    domElement: document.createElement('div')
  };
}

describe(PointCloudPickingHandler.name, () => {
  let handler: PointCloudPickingHandler;

  beforeEach(() => {
    const renderer = new Mock<WebGLRenderer>().object();
    handler = new PointCloudPickingHandler(renderer);
    vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  test('intersectPointClouds returns Classic volume metadata when annotation has annotationId', async () => {
    const shape = new Cylinder(new Vector3(0, 0, 0), new Vector3(1, 1, 1), 1);
    const annotationId = 42;
    const objectId = 1;
    const annotation: PointCloudObject<ClassicDataSourceType> = {
      annotationId,
      assetRef: { id: 345 },
      boundingBox: shape.createBoundingBox(),
      stylableObject: { shape, objectId }
    };
    const node = createPointCloudNode<ClassicDataSourceType>({ annotations: [annotation] });

    vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: node.octree,
      position: new Vector3(1, 2, 3),
      pointCloud: node.octree,
      objectId
    });

    const result = await handler.intersectPointClouds([node], createMockIntersectInput());

    expect(result).toHaveLength(1);
    assert(result[0].volumeMetadata !== undefined);
    expect(result[0].volumeMetadata).toEqual({ annotationId, assetRef: { id: 345 }, instanceRef: undefined });
  });

  test('intersectPointClouds returns DM volume metadata when annotation has volumeInstanceRef', async () => {
    const shape = new Cylinder(new Vector3(0, 0, 0), new Vector3(1, 1, 1), 1);
    const objectId = 2;
    const volumeInstanceRef = { externalId: 'vol-ext', space: 'vol-space' };
    const annotation: PointCloudObject<DMDataSourceType> = {
      volumeInstanceRef,
      boundingBox: shape.createBoundingBox(),
      stylableObject: { shape, objectId }
    };
    const node = createPointCloudNode<DMDataSourceType>({ annotations: [annotation] });

    vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: node.octree,
      position: new Vector3(1, 2, 3),
      pointCloud: node.octree,
      objectId
    });

    const result = await handler.intersectPointClouds([node], createMockIntersectInput());

    expect(result).toHaveLength(1);
    assert(result[0].volumeMetadata !== undefined);
    expect(result[0].volumeMetadata).toEqual({ volumeInstanceRef, assetRef: undefined });
  });

  test('intersectPointClouds calls pick() once with all visible octrees regardless of node count', async () => {
    const node1 = createPointCloudNode();
    const node2 = createPointCloudNode();
    const node3 = createPointCloudNode();
    const pickSpy = vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue(null);

    await handler.intersectPointClouds([node1, node2, node3], createMockIntersectInput());

    expect(pickSpy).toHaveBeenCalledOnce();
    const [, , octreesArg] = pickSpy.mock.calls[0];
    expect(octreesArg).toEqual([node1.octree, node2.octree, node3.octree]);
  });

  test('intersectPointClouds returns nearest intersection from batched pick across multiple point clouds', async () => {
    const node1 = createPointCloudNode();
    const node2 = createPointCloudNode();
    const input = createMockIntersectInput();

    // Simulate picker returning the nearest hit (node2 at distance 1) from a single batched call
    vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: node2.octree,
      position: new Vector3(1, 0, 0),
      pointCloud: node2.octree,
      objectId: 0
    });

    const result = await handler.intersectPointClouds([node1, node2], input);

    expect(result).toHaveLength(1);
    expect(result[0].pointCloudNode).toBe(node2);
    expect(result[0].point).toEqual(new Vector3(1, 0, 0));
  });

  test('intersectPointClouds filters out intersection clipped by clipping planes', async () => {
    const node = createPointCloudNode();
    // Clipping plane: normal (-1,0,0) + constant 5 → clips all points with x > 5
    const clippingPlane = new Plane(new Vector3(-1, 0, 0), 5);
    const input: IntersectInput = {
      ...createMockIntersectInput(),
      clippingPlanes: [clippingPlane]
    };

    vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: node.octree,
      position: new Vector3(10, 0, 0), // clipped
      pointCloud: node.octree,
      objectId: 0
    });

    const result = await handler.intersectPointClouds([node], input);

    expect(result).toEqual([]);
  });

  test('intersectPointClouds returns result when intersection is not clipped', async () => {
    const node = createPointCloudNode();
    // Clipping plane: normal (-1,0,0) + constant 5 → clips all points with x > 5
    const clippingPlane = new Plane(new Vector3(-1, 0, 0), 5);
    const input: IntersectInput = {
      ...createMockIntersectInput(),
      clippingPlanes: [clippingPlane]
    };

    vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: node.octree,
      position: new Vector3(1, 0, 0), // not clipped
      pointCloud: node.octree,
      objectId: 0
    });

    const result = await handler.intersectPointClouds([node], input);

    expect(result).toHaveLength(1);
    expect(result[0].point).toEqual(new Vector3(1, 0, 0));
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
    vi.spyOn(PointCloudOctreePicker.prototype, 'pick').mockImplementation(async () => {
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
