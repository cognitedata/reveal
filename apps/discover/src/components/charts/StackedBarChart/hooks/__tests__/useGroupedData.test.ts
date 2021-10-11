import { renderHook } from '@testing-library/react-hooks';

import {
  Data,
  data,
  xAxis,
  yAxis,
  groupedData,
  groupedDataWithSummedValuesInsideBars,
} from '__test-utils/fixtures/stackedBarChart';

import { useGroupedData } from '../useGroupedData';

describe('useGroupedData hook', () => {
  const getHookResult = (args?: any) => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useGroupedData<Data>({
        data,
        xAxis,
        yAxis,
        ...args,
      })
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return grouped data without grouping inside the bars', () => {
    const result = getHookResult();
    expect(result).toEqual(groupedData);
  });

  it('should return grouped data with grouping inside the bars', () => {
    const result = getHookResult({ groupDataInsideBarsBy: 'group' });
    expect(result).toEqual(groupedDataWithSummedValuesInsideBars);
  });
});
