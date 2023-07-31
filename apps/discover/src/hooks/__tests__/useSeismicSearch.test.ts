import { useDispatch } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';
import { FetchHeaders } from 'utils/fetch';

import { prefetchSurveys } from 'modules/seismicSearch/hooks';

import { QueryClientWrapper } from '../../__test-utils/queryClientWrapper';
import { useSeismicSearch } from '../useSeismicSearch';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('modules/seismicSearch/hooks', () => ({
  prefetchSurveys: jest.fn(),
}));

const headers: FetchHeaders = { headers: 'headers' };

describe('useSeismicSearch hook', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSeismicSearch(), {
      wrapper: QueryClientWrapper,
    });
    waitForNextUpdate();
    return result.current;
  };

  it('should call prefetchSurveys as expected', async () => {
    const doSeismicSearch = await getHookResult();

    doSeismicSearch({}, headers);
    expect(prefetchSurveys).toHaveBeenCalledTimes(1);
    expect(prefetchSurveys).toHaveBeenCalledWith(headers, expect.anything());
  });

  it('should not call dispatch as expected', async () => {
    const doSeismicSearch = await getHookResult();

    doSeismicSearch({}, headers);
    expect(dispatch).not.toHaveBeenCalled();

    doSeismicSearch({ phrase: '' }, headers);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
