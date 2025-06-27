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
  defaultModelIdRevisionIdFromModelOptionsDependencies,
  ModelIdRevisionIdFromModelOptionsContext
} from './useModelIdRevisionIdFromModelOptions.context';
import { Mock } from 'moq.ts';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { FdmSDK } from '../data-providers/FdmSDK';
import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(useModelIdRevisionIdFromModelOptions.name, () => {
  const classicModelOption = {
    modelId: 123,
    revisionId: 456
  };
  const dmModelOption = {
    revisionExternalId: 'default-revision-external-id1',
    revisionSpace: 'default-revision-space'
  };

  const mockClassicModelResult = new Mock<UseQueryResult<AddModelOptions<ClassicDataSourceType>>>()
    .setup((p) => p.data)
    .returns(classicModelOption)
    .object();

  const mockDMModelResult = new Mock<UseQueryResult<AddModelOptions<ClassicDataSourceType>>>()
    .setup((p) => p.data)
    .returns({
      modelId: 987,
      revisionId: 654
    })
    .object();

  const dependencies = getMocksByDefaultDependencies(
    defaultModelIdRevisionIdFromModelOptionsDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <ModelIdRevisionIdFromModelOptionsContext.Provider value={dependencies}>
      {children}
    </ModelIdRevisionIdFromModelOptionsContext.Provider>
  );

  beforeEach(() => {
    vi.resetAllMocks();
    dependencies.useFdmSdk.mockReturnValue(new FdmSDK(sdkMock));
    dependencies.useQueriedAddModelOptions.mockReturnValue([]);
  });

  test('returns empty array if input is undefined', () => {
    const { result } = renderHook(() => useModelIdRevisionIdFromModelOptions(undefined), {
      wrapper
    });
    expect(result.current).toEqual([]);
  });

  test('returns modelId & revisionId for classic model option', async () => {
    dependencies.useQueriedAddModelOptions.mockReturnValue([mockClassicModelResult]);
    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0].data).toBeDefined();
    });

    assert(result.current[0]?.data !== undefined);

    expect(isClassicIdentifier(result.current[0].data)).toBe(true);
    expect(result.current[0]?.data).toMatchObject(classicModelOption);
  });

  test('returns modelId & revisionId for dm model option', async () => {
    dependencies.useQueriedAddModelOptions.mockReturnValue([mockDMModelResult]);
    const { result } = renderHook(() => useModelIdRevisionIdFromModelOptions([dmModelOption]), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0].data).toBeDefined();
    });

    expect(isDM3DModelIdentifier(dmModelOption)).toBe(true);
    expect(result.current[0]?.data).toMatchObject({
      modelId: 987,
      revisionId: 654
    });
  });

  test('returns empty array if any query is still fetching', () => {
    const mockDMModelResult = new Mock<UseQueryResult<AddModelOptions<ClassicDataSourceType>>>()
      .setup((p) => p.data)
      .returns({
        modelId: 987,
        revisionId: 654
      })
      .setup((p) => p.isFetching)
      .returns(true)
      .object();

    dependencies.useQueriedAddModelOptions.mockReturnValue([mockDMModelResult]);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns empty array if any query is still loading', () => {
    const mockClassicModelResult = new Mock<
      UseQueryResult<AddModelOptions<ClassicDataSourceType>>
    >()
      .setup((p) => p.data)
      .returns(classicModelOption)
      .setup((p) => p.isLoading)
      .returns(true)
      .object();

    dependencies.useQueriedAddModelOptions.mockReturnValue([mockClassicModelResult]);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns empty array if any query contains error status', () => {
    const mockClassicModelResult = new Mock<
      UseQueryResult<AddModelOptions<ClassicDataSourceType>>
    >()
      .setup((p) => p.data)
      .returns(classicModelOption)
      .setup((p) => p.isError)
      .returns(true)
      .object();

    dependencies.useQueriedAddModelOptions.mockReturnValue([mockClassicModelResult]);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns empty array if any query is still refetching', () => {
    const mockDMModelResult = new Mock<UseQueryResult<AddModelOptions<ClassicDataSourceType>>>()
      .setup((p) => p.data)
      .returns({
        modelId: 987,
        revisionId: 654
      })
      .setup((p) => p.isRefetching)
      .returns(true)
      .object();

    dependencies.useQueriedAddModelOptions.mockReturnValue([mockDMModelResult]);

    const { result } = renderHook(
      () => useModelIdRevisionIdFromModelOptions([classicModelOption, dmModelOption]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });
});
