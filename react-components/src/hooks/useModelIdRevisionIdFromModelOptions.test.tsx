import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { type UseQueryResult } from '@tanstack/react-query';

import { useModelIdRevisionIdFromModelOptions } from './useModelIdRevisionIdFromModelOptions';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import {
  ModelIdRevisionIdFromModelOptionsContext,
  type ModelIdRevisionIdFromModelOptionsDependencies
} from './useModelIdRevisionIdFromModelOptions.context';
import { Mock } from 'moq.ts';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { FdmSDK } from '../data-providers/FdmSDK';
import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';

const classicModelOption = {
  modelId: 123,
  revisionId: 456
};
const dmModelOption = {
  revisionExternalId: 'default-revision-external-id1',
  revisionSpace: 'default-revision-space'
};

const mockUseQueriedAddModelOptionsResult = new Mock<
  UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>
>()
  .setup((p) => p.data)
  .returns([])
  .setup((p) => p.isFetching)
  .returns(false)
  .setup((p) => p.isLoading)
  .returns(false)
  .setup((p) => p.isError)
  .returns(false)
  .setup((p) => p.isRefetching)
  .returns(false)
  .object();

const mockUseQueriedAddModelOptions =
  vi.fn<ModelIdRevisionIdFromModelOptionsDependencies['useQueriedAddModelOptions']>();
const mockUseFdmSdk = vi.fn<ModelIdRevisionIdFromModelOptionsDependencies['useFdmSdk']>();

describe(useModelIdRevisionIdFromModelOptions.name, () => {
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <ModelIdRevisionIdFromModelOptionsContext.Provider
      value={{
        useFdmSdk: mockUseFdmSdk,
        useQueriedAddModelOptions: mockUseQueriedAddModelOptions
      }}>
      {children}
    </ModelIdRevisionIdFromModelOptionsContext.Provider>
  );

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseFdmSdk.mockReturnValue(new FdmSDK(sdkMock));
    mockUseQueriedAddModelOptions.mockReturnValue(mockUseQueriedAddModelOptionsResult);
  });

  test('returns empty array if input is undefined', () => {
    const { result } = renderHook(() => useModelIdRevisionIdFromModelOptions(undefined), {
      wrapper
    });
    expect(result.current).toEqual([]);
  });

  test('returns modelId & revisionId for classic model option', async () => {
    const resultMock = new Mock<UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>>()
      .setup((p) => p.data)
      .returns([classicModelOption])
      .setup((p) => p.isFetching)
      .returns(false)
      .setup((p) => p.isLoading)
      .returns(false)
      .setup((p) => p.isError)
      .returns(false)
      .setup((p) => p.isRefetching)
      .returns(false)
      .object();
    mockUseQueriedAddModelOptions.mockReturnValue(resultMock);
    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0]).toBeDefined();
    });

    assert(result.current[0] !== undefined);

    expect(isClassicIdentifier(result.current[0])).toBe(true);
    expect(result.current[0]).toMatchObject(classicModelOption);
  });

  test('returns modelId & revisionId for dm model option', async () => {
    const resultMock = new Mock<UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>>()
      .setup((p) => p.data)
      .returns([{ modelId: 987, revisionId: 654 }])
      .setup((p) => p.isFetching)
      .returns(false)
      .setup((p) => p.isLoading)
      .returns(false)
      .setup((p) => p.isError)
      .returns(false)
      .setup((p) => p.isRefetching)
      .returns(false)
      .object();
    mockUseQueriedAddModelOptions.mockReturnValue(resultMock);
    const { result } = renderHook(() => useModelIdRevisionIdFromModelOptions([dmModelOption]), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0]).toBeDefined();
    });

    expect(isDM3DModelIdentifier(dmModelOption)).toBe(true);
    expect(result.current[0]).toMatchObject({
      modelId: 987,
      revisionId: 654
    });
  });

  test('returns empty array if any query is still fetching', () => {
    const resultMock = new Mock<UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>>()
      .setup((p) => p.data)
      .returns([])
      .setup((p) => p.isFetching)
      .returns(true)
      .object();
    mockUseQueriedAddModelOptions.mockReturnValue(resultMock);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns empty array if any query is still loading', () => {
    const resultMock = new Mock<UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>>()
      .setup((p) => p.data)
      .returns([])
      .setup((p) => p.isLoading)
      .returns(true)
      .object();
    mockUseQueriedAddModelOptions.mockReturnValue(resultMock);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns empty array if any query contains error status', () => {
    const resultMock = new Mock<UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>>()
      .setup((p) => p.data)
      .returns([])
      .setup((p) => p.isError)
      .returns(true)
      .object();
    mockUseQueriedAddModelOptions.mockReturnValue(resultMock);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns empty array if any query is still refetching', () => {
    const resultMock = new Mock<UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>>()
      .setup((p) => p.data)
      .returns([])
      .setup((p) => p.isRefetching)
      .returns(true)
      .object();
    mockUseQueriedAddModelOptions.mockReturnValue(resultMock);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });
});
