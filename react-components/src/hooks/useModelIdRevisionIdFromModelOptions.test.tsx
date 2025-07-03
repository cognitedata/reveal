import { describe, expect, test, beforeEach, assert } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { type UseQueryResult } from '@tanstack/react-query';

import { useModelIdRevisionIdFromModelOptions } from './useModelIdRevisionIdFromModelOptions';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import {
  defaultModelIdRevisionIdFromModelOptionsDependencies,
  ModelIdRevisionIdFromModelOptionsContext
} from './useModelIdRevisionIdFromModelOptions.context';
import { Mock } from 'moq.ts';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { FdmSDK } from '../data-providers/FdmSDK';
import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

const classicModelOption = {
  modelId: 123,
  revisionId: 456
};
const dmModelOption = {
  revisionExternalId: 'default-revision-external-id1',
  revisionSpace: 'default-revision-space'
};

const mockDefaultUseQueriedAddModelOptions = new Mock<
  UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>>
>()
  .setup((p) => p.data)
  .returns([])
  .object();

const dependencies = getMocksByDefaultDependencies(
  defaultModelIdRevisionIdFromModelOptionsDependencies
);

describe(useModelIdRevisionIdFromModelOptions.name, () => {
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <ModelIdRevisionIdFromModelOptionsContext.Provider value={dependencies}>
      {children}
    </ModelIdRevisionIdFromModelOptionsContext.Provider>
  );

  beforeEach(() => {
    dependencies.useFdmSdk.mockReturnValue(new FdmSDK(sdkMock));
    dependencies.useQueriedAddModelOptions.mockReturnValue(mockDefaultUseQueriedAddModelOptions);
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
    dependencies.useQueriedAddModelOptions.mockReturnValue(resultMock);
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
    dependencies.useQueriedAddModelOptions.mockReturnValue(resultMock);
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
    dependencies.useQueriedAddModelOptions.mockReturnValue(resultMock);

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
    dependencies.useQueriedAddModelOptions.mockReturnValue(resultMock);

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
    dependencies.useQueriedAddModelOptions.mockReturnValue(resultMock);

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
    dependencies.useQueriedAddModelOptions.mockReturnValue(resultMock);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });
});
