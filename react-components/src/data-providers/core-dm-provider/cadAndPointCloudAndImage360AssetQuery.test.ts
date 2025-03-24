import { describe, it, expect } from 'vitest';
import {
  cadAndPointCloudAndImage36AssetQuery,
  cadAssetQueryPayload,
  pointCloudsAssetsQueryPayload,
  image360AssetsQueryPayload
} from './cadAndPointCloudAndImage360AssetQuery';
import {
  type Source,
  type InstanceFilter,
  type DmsUniqueIdentifier
} from '../../data-providers/FdmSDK';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';

describe(cadAndPointCloudAndImage36AssetQuery.name, () => {
  const sourcesToSearch: Source[] = [
    { externalId: 'externalId1', type: 'view', version: 'v1', space: 'space1' },
    { externalId: 'externalId2', type: 'view', version: 'v1', space: 'space1' }
  ];
  const revisionRefs: DmsUniqueIdentifier[] = [
    { externalId: 'revisionExternalId1', space: 'space1' },
    { externalId: 'revisionExternalId2', space: 'space1' }
  ];
  const filter: InstanceFilter = { equals: { property: ['key'], value: 'value' } };
  const limit = 10;

  it('should generate a query for CAD, PointCloud, and Image360 assets', () => {
    const result = cadAndPointCloudAndImage36AssetQuery(
      sourcesToSearch,
      revisionRefs,
      filter,
      limit
    );

    expect(result).toBeDefined();
    expect(result.with).toHaveProperty('cad_nodes');
    expect(result.with).toHaveProperty('pointcloud_volumes');
    expect(result.with).toHaveProperty('image360_collections');
    expect(result.select).toHaveProperty('cad_assets');
    expect(result.select).toHaveProperty('pointcloud_assets');
    expect(result.select).toHaveProperty('image360_assets');
  });

  it('should include the correct sources in the select clause', () => {
    const result = cadAndPointCloudAndImage36AssetQuery(
      sourcesToSearch,
      revisionRefs,
      filter,
      limit
    );

    expect(result.select.cad_assets.sources).toEqual(
      expect.arrayContaining([
        ...cogniteAssetSourceWithProperties,
        { source: sourcesToSearch[0], properties: ['*'] },
        { source: sourcesToSearch[1], properties: ['*'] }
      ])
    );
    expect(result.select.pointcloud_assets.sources).toEqual(
      expect.arrayContaining([
        ...cogniteAssetSourceWithProperties,
        { source: sourcesToSearch[0], properties: ['*'] },
        { source: sourcesToSearch[1], properties: ['*'] }
      ])
    );
    expect(result.select.image360_assets.sources).toEqual(
      expect.arrayContaining([
        ...cogniteAssetSourceWithProperties,
        { source: sourcesToSearch[0], properties: ['*'] },
        { source: sourcesToSearch[1], properties: ['*'] }
      ])
    );
  });

  it('should generate a query for CAD assets', () => {
    const result = cadAssetQueryPayload(sourcesToSearch, filter, limit);

    expect(result).toBeDefined();
    expect(result.with).toHaveProperty('cad_nodes');
    expect(result.with).toHaveProperty('cad_object_3d');
    expect(result.with).toHaveProperty('cad_assets');
    expect(result.select).toHaveProperty('cad_nodes');
    expect(result.select).toHaveProperty('cad_assets');
  });

  it('should generate a query for PointCloud assets', () => {
    const result = pointCloudsAssetsQueryPayload(sourcesToSearch, filter, limit);

    expect(result).toBeDefined();
    expect(result.with).toHaveProperty('pointcloud_volumes');
    expect(result.with).toHaveProperty('pointcloud_object_3d');
    expect(result.with).toHaveProperty('pointcloud_assets');
    expect(result.select).toHaveProperty('pointcloud_assets');
  });

  it('should generate a query for Image360 assets', () => {
    const result = image360AssetsQueryPayload(sourcesToSearch, revisionRefs, filter, limit);

    expect(result).toBeDefined();
    expect(result.with).toHaveProperty('image360_collections');
    expect(result.with).toHaveProperty('image360_revisions');
    expect(result.with).toHaveProperty('image360_annotations');
    expect(result.with).toHaveProperty('image360_object3ds');
    expect(result.with).toHaveProperty('image360_assets');
    expect(result.select).toHaveProperty('image360_assets');
  });
});
