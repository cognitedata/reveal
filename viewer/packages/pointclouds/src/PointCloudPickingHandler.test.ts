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
import { ClassicDataSourceType, DMDataSourceType } from '@reveal/data-providers';
import { PointCloudObject } from '@reveal/data-providers';
import { Cylinder } from '@reveal/utilities';
import assert from 'assert';

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

  test('intersectPointClouds throws when intersected point cannot be matched to a node', async () => {
    const shape = new Cylinder(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 1);
    const annotation: PointCloudObject<ClassicDataSourceType> = {
      annotationId: 1,
      boundingBox: shape.createBoundingBox(),
      stylableObject: { shape, objectId: 1 }
    };
    const node = createPointCloudNode<ClassicDataSourceType>({ annotations: [annotation] });

    jest.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: new THREE.Points(), // no parent → determinePointCloudNode returns null
      position: new THREE.Vector3(),
      objectId: 1
    });

    await expect(handler.intersectPointClouds([node], createMockIntersectInput())).rejects.toThrow(
      'Could not find PointCloudNode for intersected point'
    );
  });

  test('intersectPointClouds returns Classic volume metadata when annotation has annotationId', async () => {
    const shape = new Cylinder(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 1);
    const annotationId = 42;
    const objectId = 1;
    const annotation: PointCloudObject<ClassicDataSourceType> = {
      annotationId,
      assetRef: { id: 345 },
      boundingBox: shape.createBoundingBox(),
      stylableObject: { shape, objectId }
    };
    const node = createPointCloudNode<ClassicDataSourceType>({ annotations: [annotation] });

    jest.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: node.octree,
      position: new THREE.Vector3(1, 2, 3),
      objectId
    });

    const result = await handler.intersectPointClouds([node], createMockIntersectInput());

    expect(result).toHaveLength(1);
    assert(result[0].volumeMetadata !== undefined);
    expect(result[0].volumeMetadata).toEqual({ annotationId, assetRef: { id: 345 }, instanceRef: undefined });
  });

  test('intersectPointClouds returns DM volume metadata when annotation has volumeInstanceRef', async () => {
    const shape = new Cylinder(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 1);
    const objectId = 2;
    const volumeInstanceRef = { externalId: 'vol-ext', space: 'vol-space' };
    const annotation: PointCloudObject<DMDataSourceType> = {
      volumeInstanceRef,
      boundingBox: shape.createBoundingBox(),
      stylableObject: { shape, objectId }
    };
    const node = createPointCloudNode<DMDataSourceType>({ annotations: [annotation] });

    jest.spyOn(PointCloudOctreePicker.prototype, 'pick').mockResolvedValue({
      pointIndex: 0,
      object: node.octree,
      position: new THREE.Vector3(1, 2, 3),
      objectId
    });

    const result = await handler.intersectPointClouds([node], createMockIntersectInput());

    expect(result).toHaveLength(1);
    assert(result[0].volumeMetadata !== undefined);
    expect(result[0].volumeMetadata).toEqual({ volumeInstanceRef, assetRef: undefined });
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
