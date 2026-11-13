/*!
 * Copyright 2021 Cognite AS
 */

import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Mock, It } from 'moq.ts';
import { BufferGeometry, Float32BufferAttribute, Points } from 'three';
import type { Object3D } from 'three';

import { PointCloudLoadingStateHandler } from './PointCloudLoadingStateHandler';
import type { PointCloudNode } from './PointCloudNode';
import type { PointCloudOctree } from './potree-three-loader/tree/PointCloudOctree';
import type { DataSourceType } from '@reveal/data-providers';
import { waitUntill } from '../../../test-utilities';

function createPointCloudNode(visiblePointCounts: number[]): PointCloudNode<DataSourceType> {
  const visibleObjects: Object3D[] = visiblePointCounts.map(count => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(new Array<number>(count * 3).fill(0), 3));
    return new Points(geometry);
  });

  const octree = new Mock<PointCloudOctree>()
    .setup(o => o.id)
    .returns(1)
    .setup(o => o.traverseVisible(It.IsAny()))
    .callback(({ args }) => visibleObjects.forEach(object => args[0](object)))
    .object();

  return new Mock<PointCloudNode<DataSourceType>>()
    .setup(n => n.octree)
    .returns(octree)
    .object();
}

describe(PointCloudLoadingStateHandler.name, () => {
  const pollLoadingStatusInterval = 1;

  test('getLoadingStateObserver() triggers false initially', async () => {
    const manager = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);
    const isLoading = await firstValueFrom(manager.getLoadingStateObserver().pipe(map(x => x.isLoading)));
    expect(isLoading).toBe(false);
  });

  test('getLoadingStateObserver() triggers true after add', async () => {
    const manager = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);
    const isLoadingObs = manager.getLoadingStateObserver().pipe(map(x => x.isLoading));

    const receivedValues: boolean[] = [];
    let resolveTrue!: () => void;
    const trueReceived = new Promise<void>(resolve => {
      resolveTrue = resolve;
    });

    // Subscribe before triggering onModelAdded so the shared observable stays active
    const sub = isLoadingObs.subscribe(v => {
      receivedValues.push(v);
      if (v === true) resolveTrue();
    });

    await waitUntill(() => receivedValues.length >= 1);
    expect(receivedValues[0]).toBe(false);

    manager.onModelAdded();
    await trueReceived;
    expect(receivedValues).toContain(true);

    sub.unsubscribe();
  });

  describe('needsRedraw()', () => {
    test('is false initially', () => {
      const handler = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);

      expect(handler.needsRedraw([])).toBe(false);
    });

    test('does not traverse the nodes passed to needsRedraw()', () => {
      const handler = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);

      expect(handler.needsRedraw([createPointCloudNode([10])])).toBe(false);
    });

    test('is true after refreshPointBuffersHash() sees a changed set of visible points', () => {
      const handler = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);
      const nodes = [createPointCloudNode([10])];

      handler.refreshPointBuffersHash(nodes);

      expect(handler.needsRedraw(nodes)).toBe(true);
    });

    test('is false again once the refreshed hash has been drawn via updatePointBuffersHash()', () => {
      const handler = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);
      const nodes = [createPointCloudNode([10])];

      handler.refreshPointBuffersHash(nodes);
      handler.updatePointBuffersHash(nodes);

      expect(handler.needsRedraw(nodes)).toBe(false);
    });

    test('is true again when the visible points change after a draw and a refresh', () => {
      const handler = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);
      const initialNodes = [createPointCloudNode([10])];
      handler.refreshPointBuffersHash(initialNodes);
      handler.updatePointBuffersHash(initialNodes);

      handler.refreshPointBuffersHash([createPointCloudNode([20])]);

      expect(handler.needsRedraw([])).toBe(true);
    });
  });
});
