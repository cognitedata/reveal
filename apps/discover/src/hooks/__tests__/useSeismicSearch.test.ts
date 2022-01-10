import { QueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';
import { FetchHeaders } from 'utils/fetch';

import { prefetchSurveys } from 'modules/seismicSearch/hooks';

import { useSeismicSearch } from '../useSeismicSearch';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('modules/seismicSearch/hooks', () => ({
  prefetchSurveys: jest.fn(),
}));

const headers: FetchHeaders = { headers: 'headers' };
const queryClient = new QueryClient();

describe('useSeismicSearch hook', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSeismicSearch());
    waitForNextUpdate();
    return result.current;
  };

  it('should call prefetchSurveys as expected', async () => {
    const doSeismicSearch = await getHookResult();

    doSeismicSearch({}, headers, queryClient);
    expect(prefetchSurveys).toHaveBeenCalledTimes(1);
    expect(prefetchSurveys).toHaveBeenCalledWith(headers, queryClient);
  });

  it('should not call dispatch as expected', async () => {
    const doSeismicSearch = await getHookResult();

    doSeismicSearch({}, headers, queryClient);
    expect(dispatch).not.toHaveBeenCalled();

    doSeismicSearch({ phrase: '' }, headers, queryClient);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
