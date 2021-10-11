import { renderHook } from '@testing-library/react-hooks';

import {
  Data,
  groupedData,
  xAxis,
  xScaleMaxValue,
} from '__test-utils/fixtures/stackedBarChart';

import { useXScaleMaxValue } from '../useXScaleMaxValue';

describe('useXScaleMaxValue hook', () => {
  const getHookResult = () => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useXScaleMaxValue<Data>({
        groupedData,
        xAccessor: xAxis.accessor as keyof Data,
      })
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return the same input data when options are not passed', () => {
    const result = getHookResult();
    expect(result).toEqual(xScaleMaxValue);
  });
});
