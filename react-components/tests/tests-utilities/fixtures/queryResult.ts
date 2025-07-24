import { type UseQueryResult } from '@tanstack/react-query';
import { vi } from 'vitest';

export const createMockQueryResult = <T>(data: T, isFetching = false): UseQueryResult<T> =>
  ({
    data,
    isFetching,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn()
  }) as unknown as UseQueryResult<T>;

export const createMockQueryResultNoData = <T>(): UseQueryResult<T> =>
  ({
    data: undefined,
    isFetching: false,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn()
  }) as unknown as UseQueryResult<T>;
