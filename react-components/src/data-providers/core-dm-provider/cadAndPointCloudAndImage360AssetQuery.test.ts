import { describe, it, expect, assertType } from 'vitest';
import {
  cadAndPointCloudAndImage36AssetQuery,
  cadAssetQueryPayload,
  pointCloudsAssetsQueryPayload,
  image360AssetsQueryPayload
} from './cadAndPointCloudAndImage360AssetQuery';
import {
  type Source,
  type InstanceFilter,
  type DmsUniqueIdentifier,
  type Query
} from '../../data-providers/FdmSDK';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';
import { expectDmsQueryToBeValid } from '#test-utils/dms/expectDmsQueryToBeValid';
import { expectWithExpressionClausesToHaveLimit } from '#test-utils/dms/expectWithExpressionClausesToHaveLimit';

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

describe(cadAndPointCloudAndImage36AssetQuery.name, () => {
  it('should generate a valid query for CAD, PointCloud, and Image360 assets ', () => {
    const result = cadAndPointCloudAndImage36AssetQuery(
      sourcesToSearch,
      revisionRefs,
      filter,
      limit
    );

    assertType<Query>(result);
    expectDmsQueryToBeValid(result);
  });

  it('should include the correct filters in the with clause', () => {
    const result = cadAndPointCloudAndImage36AssetQuery(
      sourcesToSearch,
      revisionRefs,
      filter,
      limit
    );

    expect(result.with.cad_assets.nodes.filter).toEqual(filter);
    expect(result.with.pointcloud_assets.nodes.filter).toEqual(filter);
  });

  it('should include the correct limits in the with clause', () => {
    const result = cadAndPointCloudAndImage36AssetQuery(
      sourcesToSearch,
      revisionRefs,
      filter,
      limit
    );

    expectWithExpressionClausesToHaveLimit(result, limit);
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
});

describe(cadAssetQueryPayload.name, () => {
  it('cadAssetQueryPayload should generate a query for CAD assets', () => {
    const result = cadAssetQueryPayload(sourcesToSearch, filter, limit);

    expectDmsQueryToBeValid(result);
    expectWithExpressionClausesToHaveLimit(result, limit);

    expect(result.with.cad_assets.nodes.filter).toEqual(filter);
    expect(result.select.cad_assets.sources).toEqual(
      expect.arrayContaining([
        ...cogniteAssetSourceWithProperties,
        { source: sourcesToSearch[0], properties: ['*'] },
        { source: sourcesToSearch[1], properties: ['*'] }
      ])
    );
  });
});

describe(pointCloudsAssetsQueryPayload.name, () => {
  it('pointCloudAssetsQueryPayload should generate a query for PointCloud assets', () => {
    const result = pointCloudsAssetsQueryPayload(sourcesToSearch, filter, limit);

    expectDmsQueryToBeValid(result);
    expectWithExpressionClausesToHaveLimit(result, limit);

    expect(result.with.pointcloud_assets.nodes.filter).toEqual(filter);
    expect(result.select.pointcloud_assets.sources).toEqual(
      expect.arrayContaining([
        ...cogniteAssetSourceWithProperties,
        { source: sourcesToSearch[0], properties: ['*'] },
        { source: sourcesToSearch[1], properties: ['*'] }
      ])
    );
  });
});

describe(image360AssetsQueryPayload.name, () => {
  it('image360AssetsQueryPayload should generate a query for Image360 assets', () => {
    const result = image360AssetsQueryPayload(sourcesToSearch, revisionRefs, filter, limit);

    expectDmsQueryToBeValid(result);
    expectWithExpressionClausesToHaveLimit(result, limit);

    expect(result.with.image360_assets.nodes.filter).toEqual(filter);
    expect(result.select.image360_assets.sources).toEqual(
      expect.arrayContaining([
        ...cogniteAssetSourceWithProperties,
        { source: sourcesToSearch[0], properties: ['*'] },
        { source: sourcesToSearch[1], properties: ['*'] }
      ])
    );
  });
});
