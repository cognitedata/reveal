import { QueryClient, type QueryFunctionContext, type UseQueryResult } from '@tanstack/react-query';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';

export function createMockQueryResult<T>(
  data: T,
  isFetching = false,
  isLoading = false,
  isError = false,
  error: Error | null = null
): UseQueryResult<T> {
  return new Mock<UseQueryResult<T>>()
    .setup((instance) => instance.data)
    .returns(data)
    .setup((instance) => instance.isFetching)
    .returns(isFetching)
    .setup((instance) => instance.isLoading)
    .returns(isLoading)
    .setup((instance) => instance.isError)
    .returns(isError)
    .setup((instance) => instance.error)
    .returns(error)
    .setup((instance) => instance.refetch)
    .returns(vi.fn())
    .setup((instance) => instance.isLoadingError)
    .returns(false)
    .object();
}

export function createMockQueryResultNoData<T>(): UseQueryResult<T> {
  return new Mock<UseQueryResult<T>>()
    .setup((instance) => instance.data)
    .returns(undefined)
    .setup((instance) => instance.isFetching)
    .returns(false)
    .setup((instance) => instance.isLoading)
    .returns(false)
    .setup((instance) => instance.isError)
    .returns(false)
    .setup((instance) => instance.error)
    .returns(null)
    .setup((instance) => instance.refetch)
    .returns(vi.fn())
    .object();
}

// Helper to create mock query context
export const createMockQueryContext = (
  queryKey: readonly unknown[]
): QueryFunctionContext<readonly unknown[]> => ({
  queryKey,
  signal: new AbortController().signal,
  meta: undefined,
  client: new QueryClient()
});
