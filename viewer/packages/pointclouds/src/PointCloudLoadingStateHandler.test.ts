/*!
 * Copyright 2021 Cognite AS
 */

import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import { PointCloudLoadingStateHandler } from './PointCloudLoadingStateHandler';
import { waitUntill } from '../../../test-utilities';

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
});
