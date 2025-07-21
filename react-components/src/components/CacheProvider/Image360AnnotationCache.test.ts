import { describe, it, expect, beforeEach } from 'vitest';
import { Image360AnnotationCache } from './Image360AnnotationCache';
import { viewerImage360CollectionsMock, viewerMock } from '#test-utils/fixtures/viewer';
import { retrieveMock, sdkMock } from '#test-utils/fixtures/sdk';
import { createImage360ClassicMock, findImageAnnotationsMock } from '#test-utils/fixtures/image360';
import { type Asset } from '@cognite/sdk';
import { type DataSourceType, type InstanceReference } from '@cognite/reveal';
import { createAssetMock } from '#test-utils/fixtures/assets';
import { mockImage360AnnotationAssetResult } from '#test-utils/fixtures/image360AssetWithAnnotation';

describe(Image360AnnotationCache.name, () => {
  let cache: Image360AnnotationCache;
  let assets: Asset[];
  const mockImage360Collection = createImage360ClassicMock();

  const mockAssetInstance: Array<InstanceReference<DataSourceType>> = [{ id: 1 }];

  beforeEach(() => {
    assets = [createAssetMock(1)];
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);
    findImageAnnotationsMock.mockResolvedValue([mockImage360AnnotationAssetResult]);
  });

  it('returns empty array if viewer is undefined', async () => {
    const cacheNoViewer = new Image360AnnotationCache(sdkMock, undefined);
    const result = await cacheNoViewer.getReveal360AnnotationsForAssets(
      ['site1'],
      mockAssetInstance
    );
    expect(result).toEqual([]);
  });

  it('fetches and maps annotations', async () => {
    cache = new Image360AnnotationCache(sdkMock, viewerMock);
    retrieveMock.mockResolvedValueOnce([assets[0]]);

    const result = await cache.getReveal360AnnotationsForAssets(['siteId'], mockAssetInstance);
    expect(mockImage360Collection.findImageAnnotations).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].asset).toEqual(assets[0]);
  });

  it('returns cached result if available', async () => {
    const cache = new Image360AnnotationCache(sdkMock, viewerMock);
    retrieveMock.mockResolvedValueOnce([assets[0]]);

    await cache.getReveal360AnnotationsForAssets(['siteId'], mockAssetInstance);
    findImageAnnotationsMock.mockClear();

    const result = await cache.getReveal360AnnotationsForAssets(['siteId'], mockAssetInstance);

    expect(findImageAnnotationsMock).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].asset).toEqual(assets[0]);
  });

  it('throws if findImageAnnotations API request fails', async () => {
    cache = new Image360AnnotationCache(sdkMock, viewerMock);
    retrieveMock.mockResolvedValueOnce([assets[0]]);
    findImageAnnotationsMock.mockRejectedValueOnce(new Error('API error'));

    await expect(
      cache.getReveal360AnnotationsForAssets(['siteId'], mockAssetInstance)
    ).rejects.toThrow('API error');
  });
});
