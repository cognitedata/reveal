import { describe, expect, test, vi } from 'vitest';
import { getImage360CollectionsForAsset } from './getImage360CollectionsForAsset';
import { Mock } from 'moq.ts';
import { type CogniteClient, type FileInfo } from '@cognite/sdk';

describe(getImage360CollectionsForAsset.name, () => {
  const ASSET_ID = 123;
  const FILE_ID = 90;
  const SITE_ID = 'a_site_id';

  const mockFileInfo: FileInfo = {
    id: FILE_ID,
    createdTime: new Date('2025-05-05'),
    lastUpdatedTime: new Date('2025-05-05'),
    uploaded: true,
    name: 'a-file',
    metadata: {
      site_id: SITE_ID
    }
  };

  const mockReverseLookup = vi.fn<CogniteClient['annotations']['reverseLookup']>();
  const mockRetrieveFile = vi.fn<CogniteClient['files']['retrieve']>();

  const sdkMock = new Mock<CogniteClient>()
    .setup((p) => p.annotations.reverseLookup)
    .returns(mockReverseLookup)
    .setup((p) => p.files.retrieve)
    .returns(mockRetrieveFile)
    .object();

  test('reverseLookup is called with expected input', async () => {
    mockReverseLookup.mockResolvedValue({ items: [] });
    await getImage360CollectionsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(mockReverseLookup).toHaveBeenCalledWith({
      filter: {
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink',
        data: { assetRef: { id: ASSET_ID } }
      },
      limit: 1000
    });
  });

  test('retrieve is called with expected input', async () => {
    mockReverseLookup.mockResolvedValue({
      items: [
        {
          id: FILE_ID
        }
      ]
    });

    mockRetrieveFile.mockResolvedValue([]);

    await getImage360CollectionsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(mockRetrieveFile).toHaveBeenCalledWith([{ id: FILE_ID }], { ignoreUnknownIds: true });
  });

  test('returns an empty result from SDK', async () => {
    mockReverseLookup.mockResolvedValue({ items: [] });

    const result = await getImage360CollectionsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(result).toEqual([]);
  });

  test('returns no results when SDK returns values, but no associated collections exist', async () => {
    mockReverseLookup.mockResolvedValue({
      items: [
        {
          id: FILE_ID
        }
      ]
    });

    mockRetrieveFile.mockResolvedValue([]);

    const result = await getImage360CollectionsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(result).toEqual([]);
  });

  test('returns no results if no files have siteID', async () => {
    mockReverseLookup.mockResolvedValue({
      items: [
        {
          id: FILE_ID
        }
      ]
    });

    mockRetrieveFile.mockResolvedValue([{ ...mockFileInfo, metadata: {} }]);
    const result = await getImage360CollectionsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(result).toEqual([]);
  });

  test('returns relevant site when collection exists', async () => {
    mockReverseLookup.mockResolvedValue({
      items: [
        {
          id: FILE_ID
        }
      ]
    });

    mockRetrieveFile.mockResolvedValue([mockFileInfo]);
    const result = await getImage360CollectionsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(result).toEqual([
      { type: 'image360', addOptions: { source: 'events', siteId: SITE_ID } }
    ]);
  });
});
