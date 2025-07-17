import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useImage360AnnotationMappingsForInstanceReferences } from './useImage360AnnotationMappingsForInstanceReferences';
import * as CacheProvider from '../components/CacheProvider/CacheProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockAssetInfo = [
  {
    asset: { id: 'asset1' },
    assetAnnotationImage360Info: {
      annotation: { annotation: { id: 'ann1' }, getCenter: () => ({ applyMatrix4: vi.fn(() => ({})) }) },
      image: { transform: {} }
    },
    position: {}
  }
];

describe(useImage360AnnotationMappingsForInstanceReferences.name, () => {
  beforeEach(() => {
    vi.spyOn(CacheProvider, 'useImage360AnnotationCache').mockReturnValue({
      getReveal360AnnotationsForAssets: vi.fn().mockResolvedValue(mockAssetInfo)
    } as any);
  });

  it('returns empty array if assetIds or siteIds are undefined', async () => {
    const queryClient = new QueryClient();
    const { result } = renderHook(
      () => useImage360AnnotationMappingsForInstanceReferences(undefined, undefined),
      { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> }
    );
    expect(result.current.data).toEqual([]);
  });

  it('returns filtered annotation asset info', async () => {
    const queryClient = new QueryClient();
    const { result, waitFor } = renderHook(
      () => useImage360AnnotationMappingsForInstanceReferences([{ id: 'asset1' }], ['site1']),
      { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> }
    );
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].asset.id).toBe('asset1');
  });
});