import { renderHook } from '@testing-library/react-hooks';
import { useSDK } from '@cognite/sdk-provider';
import { QueryClient } from 'react-query';
import { DEFAULT_RUN_LIMIT } from 'utils/RunsAPI';
import { createRunsFilter, useFilteredRuns, useRuns } from 'hooks/useRuns';
import { mockDataRunsResponse, mockError } from 'utils/mockResponse';
import { renderWithQueryClient } from 'utils/test/render';
import { RunStatusAPI, RunStatusUI } from 'model/Status';
import { getBaseUrl } from 'utils/baseURL';

describe('useRuns', () => {
  const externalId = 'dataExtpipe000-1';
  let client;
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
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: mockDataRunsResponse }),
      project: 'test-project',
    });
    const { result, waitFor } = renderHook(() => useRuns(externalId), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.data).toEqual(mockDataRunsResponse);
    });
  });

  test('Returns error on fail', async () => {
    const rejectValue = mockError;
    useSDK.mockReturnValue({
      get: () => Promise.reject(rejectValue),
    });
    const { result, waitFor } = renderHook(() => useRuns(externalId), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(rejectValue);
    });
  });
});

describe('useFilteredRuns', () => {
  let client;
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
    useSDK.mockReturnValue({
      post: jest.fn(() => Promise.resolve({ data: mockDataRunsResponse })),
      project: 'test-project',
    });
    const params = {
      externalId: 'external_id_1',
    };
    const { result, waitFor } = renderHook(() => useFilteredRuns(params), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.runs).toBeDefined();
    });
    expect(useSDK().post).toHaveBeenCalledTimes(1);
    expect(useSDK().post).toHaveBeenCalledWith(
      `${getBaseUrl('test-project')}/runs/list`,
      {
        data: {
          filter: { externalId: params.externalId },
          cursor: undefined,
          limit: DEFAULT_RUN_LIMIT,
        },
        withCredentials: true,
      }
    );
    expect(result.current.data?.runs.length).toEqual(
      mockDataRunsResponse.items.length
    );
    expect(result.current.data?.runs[0].status).toEqual(RunStatusUI.FAILURE);
    expect(result.current.data?.runs[1].status).toEqual(RunStatusUI.SUCCESS);
  });
});

describe('createRunsFilter', () => {
  test('Creates filter', () => {
    const statuses = [RunStatusAPI.SUCCESS];
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
    expect(res.limit).toEqual(DEFAULT_RUN_LIMIT);
    expect(res.cursor).toBeUndefined();
  });
  test('Creates empty filter', () => {
    const res = createRunsFilter({});
    expect(res.filter).toBeDefined();
    expect(res.filter.externalId).toBeUndefined();
    expect(res.filter.createdTime).toBeUndefined();
    expect(res.filter.message).toBeUndefined();
    expect(res.filter.statuses).toBeUndefined();
    expect(res.limit).toEqual(DEFAULT_RUN_LIMIT);
    expect(res.cursor).toBeUndefined();
  });
});
