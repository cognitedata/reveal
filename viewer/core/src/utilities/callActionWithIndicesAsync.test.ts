/*!
 * Copyright 2021 Cognite AS
 */
import { callActionWithIndicesAsync } from './callActionWithIndicesAsync';

describe('test callActionWithIndicesAsync', () => {
  it('calls an action with specified indices range', async () => {
    const start = 10;
    const end = 100000;
    const timesToCall = end - start + 1;
    const action = jest.fn();
    await callActionWithIndicesAsync(start, end, action);
    expect(action).toBeCalledTimes(timesToCall);
    expect(action).toHaveBeenNthCalledWith(1, start);
    expect(action).toHaveBeenNthCalledWith(1 + 1234, start + 1234);
    expect(action).toHaveBeenNthCalledWith(timesToCall, end);
  });
});
