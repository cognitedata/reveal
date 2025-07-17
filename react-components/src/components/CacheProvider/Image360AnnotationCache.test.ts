import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Image360AnnotationCache } from './Image360AnnotationCache';
import { type CogniteClient } from '@cognite/sdk';
import { type InstanceReference } from '../../utilities/instanceIds';
import { type Image360Collection } from '@cognite/reveal';

function createMockViewer(collections: any[] = []) {
  return {
    get360ImageCollections: vi.fn(() => collections)
  };
}

function createMockCollection(id: string, annotations: any[] = []) {
  return {
    id,
    findImageAnnotations: vi.fn().mockResolvedValue(annotations)
  };
}

const mockSdk = {} as CogniteClient;
const mockAsset = { id: 'asset1' };
const mockAssetInstance: InstanceReference = { id: 'asset1' };

describe('Image360AnnotationCache', () => {
  let cache: Image360AnnotationCache;
  let mockViewer: any;
  let mockCollection: any;

  beforeEach(() => {
    mockCollection = createMockCollection('site1', [
      { annotation: { annotation: { id: 'ann1' }, getCenter: () => ({ applyMatrix4: vi.fn(() => ({})) }) }, image: { transform: {} } }
    ]);
    mockViewer = createMockViewer([mockCollection]);
    cache = new Image360AnnotationCache(mockSdk, mockViewer);
  });

  it('returns empty array if viewer is undefined', async () => {
    const cacheNoViewer = new Image360AnnotationCache(mockSdk, undefined);
    const result = await cacheNoViewer.getReveal360AnnotationsForAssets(['site1'], [mockAssetInstance]);
    expect(result).toEqual([]);
  });

  it('returns cached result if available', async () => {
    const key = [mockAssetInstance].map(a => a.id).sort().join();
    (cache as any)._annotationToAssetMappingsWithAssetInstance.set(key, ['cached']);
    const result = await cache.getReveal360AnnotationsForAssets(['site1'], [mockAssetInstance]);
    expect(result).toEqual(['cached']);
  });

  it('fetches and maps annotations', async () => {
    // Mock fetchAssetsForAssetReferences to return the asset
    vi.mock('./annotationModelUtils', () => ({
      fetchAssetsForAssetReferences: vi.fn().mockResolvedValue([mockAsset])
    }));

    const result = await cache.getReveal360AnnotationsForAssets(['site1'], [mockAssetInstance]);
    expect(Array.isArray(result)).toBe(true);
    expect(mockCollection.findImageAnnotations).toHaveBeenCalled();
  });
});