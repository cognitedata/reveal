import { renderHook } from '@testing-library/react-hooks';

import { Data, data, xAxis } from '__test-utils/fixtures/stackedBarChart';

import { useProcessedData } from '../useProcessedData';

describe('useProcessedData hook', () => {
  const getHookResult = () => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useProcessedData<Data>({ data, xAxis })
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return the same input data when options are not passed', () => {
    const processedData = getHookResult();
    expect(processedData).toEqual(data);
  });
});
