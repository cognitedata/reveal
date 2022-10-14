/*!
 * Copyright 2021 Cognite AS
 */

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { yieldProcessing } from '../../../test-utilities';

import { Potree, PointCloudOctree } from './potree-three-loader';
import { Mock } from 'moq.ts';
import { ModelDataProvider } from '@reveal/data-providers';
import { PointCloudMaterialManager, PointCloudMaterial } from '@reveal/rendering';

const mockModelDataProvider = new Mock<ModelDataProvider>().object();
const mockMaterialManager = new Mock<PointCloudMaterialManager>().object();

describe('PotreeGroupWrapper', () => {
  const pollLoadingStatusInterval = 1;

  test('getLoadingStateObserver() triggers false initially', done => {
    const manager = new PotreeGroupWrapper(
      new Potree(mockModelDataProvider, mockMaterialManager),
      pollLoadingStatusInterval
    );
    expectObservable(manager.getLoadingStateObserver().pipe(map(x => x.isLoading)), [false], done);
  });
  test('getLoadingStateObserver() triggers true after add', done => {
    const dummyNode: PointCloudOctree = new Mock<PointCloudOctree>()
      .setup(p => p.isObject3D)
      .returns(true)
      .setup(p => p.parent)
      .returns(null)
      .setup(p => p.dispatchEvent)
      .returns((_: any) => {})
      .setup(p => p.material)
      .returns(new PointCloudMaterial())
      .object();
    const model = new PotreeNodeWrapper(dummyNode, [], Symbol('dummy'), { classificationSets: [] });
    const manager = new PotreeGroupWrapper(
      new Potree(mockModelDataProvider, mockMaterialManager),
      pollLoadingStatusInterval
    );

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
