/*!
 * Copyright 2021 Cognite AS
 */

import { NodeStyleUpdater } from './NodeStyleUpdater';
import { NumericRange } from '../../utilities';

describe('NodeStyleUpdater', () => {
  const updateCallback: (treeIndices: number[]) => void = jest.fn();
  const updater = new NodeStyleUpdater(updateCallback);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  test('triggerUpdateRange, schedules update', () => {
    updater.triggerUpdateRange(new NumericRange(0, 100));
    jest.runAllTimers();
    expect(updateCallback).toBeCalledTimes(1);
  });

  test('triggerUpdateArray, schedules update', () => {
    updater.triggerUpdateArray([1, 2, 3]);
    jest.runAllTimers();
    expect(updateCallback).toBeCalledTimes(1);
  });

  test('triggerUpdateSingle, schedules update', () => {
    updater.triggerUpdateSingle(1);
    jest.runAllTimers();
    expect(updateCallback).toBeCalledTimes(1);
  });

  test('many triggers in one batch, triggers update once', () => {
    updater.triggerUpdateRange(new NumericRange(0, 100));
    updater.triggerUpdateArray([1000, 1002, 1003]);
    updater.triggerUpdateSingle(2000);
    jest.runAllTimers();
    expect(updateCallback).toBeCalledTimes(1);
  });
});
