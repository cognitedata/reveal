import { renderHook } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { RunStatus } from 'utils/runsUtils';
import { DEFAULT_LIMIT } from 'utils/RunsAPI';
import { createRunsFilter, useRuns } from 'hooks/useRuns';
import { mockError, mockDataRunsResponse } from 'utils/mockResponse';
import { renderWithQueryClient } from 'utils/test/render';

describe('useRuns', () => {
  const externalId = 'dataIntegration000-1';
  let client: QueryClient;
  let wrapper;
  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = renderWithQueryClient(client);
  });

  test('Returns runs on success', async () => {
    sdkv3.get.mockResolvedValue({ data: mockDataRunsResponse });
    const { result, waitFor } = renderHook(() => useRuns(externalId), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.data).toEqual(mockDataRunsResponse);
    });
  });

  test('Returns error on fail', async () => {
    const rejectValue = mockError;
    sdkv3.get.mockRejectedValue(rejectValue);
    const { result, waitFor } = renderHook(() => useRuns(externalId), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(rejectValue);
    });
  });
});

describe('createRunsFilter', () => {
  test('Creates filter', () => {
    const statuses = [RunStatus.SUCCESS];
    const search = 'message';
    const externalId = 'testid';
    const dateRange = {
      startDate: new Date(2021, 5, 1),
      endDate: new Date(2021, 5, 21),
    };
    const res = createRunsFilter({ externalId, dateRange, statuses, search });
    expect(res.filter.externalId).toEqual(externalId);
    expect(res.filter.createdTime.max).toBeDefined();
    expect(res.filter.createdTime.min).toBeDefined();
    expect(res.filter.message.substring).toEqual(search);
    expect(res.filter.statuses).toEqual(statuses);
    expect(res.limit).toEqual(DEFAULT_LIMIT);
    expect(res.cursor).toBeUndefined();
  });
  test('Creates empty filter', () => {
    const res = createRunsFilter({});
    expect(res.filter).toBeDefined();
    expect(res.filter.externalId).toBeUndefined();
    expect(res.filter.createdTime).toBeUndefined();
    expect(res.filter.message).toBeUndefined();
    expect(res.filter.statuses).toBeUndefined();
    expect(res.limit).toEqual(DEFAULT_LIMIT);
    expect(res.cursor).toBeUndefined();
  });
});
