import { type UseQueryResult } from '@tanstack/react-query';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';

export function createMockQueryResult<T>(data: T, isFetching = false): UseQueryResult<T> {
  return new Mock<UseQueryResult<T>>()
    .setup((instance) => instance.data)
    .returns(data)
    .setup((instance) => instance.isFetching)
    .returns(isFetching)
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