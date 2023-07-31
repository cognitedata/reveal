import { renderHook } from '@testing-library/react-hooks';

import { Data, data, accessors } from '__test-utils/fixtures/charts';

import { useXScaleRange } from '../useXScaleRange';

describe('useXScaleRange hook', () => {
  const getHookResult = (useGroupedValues?: boolean) => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useXScaleRange<Data>({
        data,
        accessors,
        useGroupedValues,
      })
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return the x scale range as expected', () => {
    expect(getHookResult()).toEqual([20, 91]);
    expect(getHookResult(true)).toEqual([110, 161]);
  });
});
