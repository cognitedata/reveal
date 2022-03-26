/*!
 * Copyright 2021 Cognite AS
 */

import * as Potree from '@cognite/potree-core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as THREE from 'three';

import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { yieldProcessing } from '../../../test-utilities';

describe('PotreeGroupWrapper', () => {
  const pollLoadingStatusInterval = 1;

  test('getLoadingStateObserver() triggers false initially', done => {
    const manager = new PotreeGroupWrapper(pollLoadingStatusInterval);
    expectObservable(manager.getLoadingStateObserver().pipe(map(x => x.isLoading)), [false], done);
  });

  test('getLoadingStateObserver() triggers true after add', done => {
    const dummyNode: Potree.PointCloudOctreeNode = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial()
    );
    const model = new PotreeNodeWrapper(dummyNode);
    const manager = new PotreeGroupWrapper(pollLoadingStatusInterval);

    expectObservable(manager.getLoadingStateObserver().pipe(map(x => x.isLoading)), [false], done);
    manager.addPointCloud(model);
  });
});

async function expectObservable<T, U>(observable: Observable<T>, expectedValues: U[], done: () => void): Promise<void> {
  if (expectedValues.length === 0) {
    fail('Must expect at least one value');
  }

  let index = 0;
  const subscription = observable.subscribe(value => {
    expect(value).toEqual(expectedValues[index++]);
    if (index === expectedValues.length) {
      done();
    }
  });

  while (index < expectedValues.length) {
    await yieldProcessing();
  }
  subscription.unsubscribe();
}
