import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  useFetchClassicAssets,
  UseFetchAllClassicAssetsContext,
  defaultUseFetchAllClassicAssetsDependencies
} from './useFetchClassicAssets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren, type ReactElement } from 'react';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { Mock } from 'moq.ts';
import {
  type Asset,
  type AssetsAPI,
  type CogniteClient,
  type CursorAndAsyncIterator
} from '@cognite/sdk';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';
import { createAssetMock } from '#test-utils/fixtures/assets';

describe(useFetchClassicAssets.name, () => {
  const queryClient = new QueryClient();

  const dependencies = getMocksByDefaultDependencies(defaultUseFetchAllClassicAssetsDependencies);

  const mockAssets = [createAssetMock(1), createAssetMock(2), createAssetMock(3)];

  const mockAssetIds = Array.from({ length: 150 }, (_, i) => ({ id: i + 1 }));

  const listAssetsMock = vi.fn<AssetsAPI['list']>(
    (): CursorAndAsyncIterator<Asset> => createCursorAndAsyncIteratorMock({ items: [] })
  );

  const assetRetrieveMock = new Mock<AssetsAPI>()
    .setup((p) => p.list)
    .returns(listAssetsMock)
    .object();

  const sdkMock = new Mock<CogniteClient>()
    .setup((p) => p.getBaseUrl())
    .returns('https://api.cognitedata.com')
    .setup((p) => p.project)
    .returns('test-project')
    .setup((p) => p.assets)
    .returns(assetRetrieveMock)
    .object();

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <UseFetchAllClassicAssetsContext.Provider value={dependencies}>
        {children}
      </UseFetchAllClassicAssetsContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    listAssetsMock.mockImplementation(
      (): CursorAndAsyncIterator<Asset> =>
        createCursorAndAsyncIteratorMock({
          items: []
        })
    );
    queryClient.clear();
    dependencies.useSDK.mockReturnValue(sdkMock);
  });

  test('fetches all assets with pagination', async () => {
    listAssetsMock.mockImplementation(
      (): CursorAndAsyncIterator<Asset> =>
        createCursorAndAsyncIteratorMock({
          items: mockAssets
        })
    );

    const { result } = renderHook(() => useFetchClassicAssets(mockAssetIds), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAssets.concat(mockAssets));
  });

  test('returns empty array if no assets', async () => {
    const { result } = renderHook(() => useFetchClassicAssets(mockAssetIds), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
