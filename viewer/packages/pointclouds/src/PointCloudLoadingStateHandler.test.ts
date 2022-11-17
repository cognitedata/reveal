/*!
 * Copyright 2021 Cognite AS
 */

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PointCloudLoadingStateHandler } from './PointCloudLoadingStateHandler';
import { yieldProcessing } from '../../../test-utilities';

describe(PointCloudLoadingStateHandler.name, () => {
  const pollLoadingStatusInterval = 1;

  test('getLoadingStateObserver() triggers false initially', done => {
    const manager = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);
    expectObservable(manager.getLoadingStateObserver().pipe(map(x => x.isLoading)), [false], done);
  });
  test('getLoadingStateObserver() triggers true after add', done => {
    const manager = new PointCloudLoadingStateHandler(pollLoadingStatusInterval);

    expectObservable(manager.getLoadingStateObserver().pipe(map(x => x.isLoading)), [false], done);
    manager.onModelAdded();
    expectObservable(manager.getLoadingStateObserver().pipe(map(x => x.isLoading)), [true], done);
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
