/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import {
  Asset,
  AssetMapping3D,
  AssetMappings3DAPI,
  AssetMappings3DListFilter,
  AssetsAPI,
  CogniteClient,
  InternalId,
  Node3D,
  Revisions3DAPI
} from '@cognite/sdk';
import { It, Mock, Times } from 'moq.ts';
import { AssetNodeCollection } from './AssetNodeCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { createListResponse } from './stubs/createListResponse';
import isEqual from 'lodash/isEqual';

describe(AssetNodeCollection.name, () => {
  let mockClient: Mock<CogniteClient>;
  let mockAssetMappings3D: Mock<AssetMappings3DAPI>;
  let mockRevisions3D: Mock<Revisions3DAPI>;
  let mockAssets: Mock<AssetsAPI>;
  let mockNodeCollectionDataProvider: Mock<CdfModelNodeCollectionDataProvider>;

  beforeEach(() => {
    mockAssetMappings3D = new Mock<AssetMappings3DAPI>();
    mockAssetMappings3D.setup(x => x.list(It.IsAny(), It.IsAny(), It.IsAny())).returnsAsync(createListResponse([], 10));
    mockAssetMappings3D
      .setup(x => x.filter(It.IsAny(), It.IsAny(), It.IsAny()))
      .returnsAsync(createListResponse([], 10));

    mockRevisions3D = new Mock<Revisions3DAPI>();
    mockRevisions3D
      .setup(X => X.retrieve3DNodes(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(args => {
        const nodeIds = args.args[2] as InternalId[];
        return Promise.resolve(nodeIds.map(x => createNode(x.id)));
      });

    mockAssets = new Mock<AssetsAPI>();
    mockAssets
      .setup(x => x.retrieve(It.IsAny(), It.IsAny()))
      .callback(args => {
        const ids = args.args[0] as InternalId[];
        return Promise.resolve(ids.map(x => createAsset(x.id)));
      });

    mockClient = new Mock<CogniteClient>();
    mockClient.setup(x => x.assetMappings3D).returns(mockAssetMappings3D.object());
    mockClient.setup(x => x.revisions3D).returns(mockRevisions3D.object());
    mockClient.setup(x => x.assets).returns(mockAssets.object());

    mockNodeCollectionDataProvider = new Mock<CdfModelNodeCollectionDataProvider>();
    mockNodeCollectionDataProvider
      .setup(x => x.mapBoxFromCdfToModelCoordinates(It.IsAny(), It.IsAny()))
      .callback(args => {
        const source = args.args[0] as THREE.Box3;
        const target = args.args[1] as THREE.Box3;
        target.copy(source);
        return target;
      })
      .setup(x => x.mapBoxFromModelToCdfCoordinates(It.IsAny(), It.IsAny()))
      .callback(args => {
        const source = args.args[0] as THREE.Box3;
        const target = args.args[1] as THREE.Box3;
        target.copy(source);
        return target;
      });
  });

  test('state is as expected after creation', () => {
    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    expect(collection.isLoading).toBeFalse();
    expect(collection.getAreas().isEmpty).toBeTrue();
    expect(collection.getIndexSet().count).toEqual(0);
  });

  test('executeFilter without filter fetches all', async () => {
    mockAssetMappings3D
      .setup(x => x.list(It.IsAny(), It.IsAny(), It.IsAny()))
      .returnsAsync(createListResponse(createAssetMappings(10), 10));

    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await collection.executeFilter({});

    expect(collection.getIndexSet().toIndexArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test('executeFilter with assetId-filter, applies filter to request', async () => {
    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await collection.executeFilter({ assetId: 55 });

    mockAssetMappings3D.verify(
      x =>
        x.list(
          It.IsAny(),
          It.IsAny(),
          It.Is<AssetMappings3DListFilter | undefined>(x => x?.assetId === 55)
        ),
      Times.Once()
    );
  });

  test('executeFilter with bounding box filter, applies filter to request', async () => {
    mockAssetMappings3D
      .setup(x => x.list(It.IsAny(), It.IsAny(), It.IsAny()))
      .returnsAsync(createListResponse(createAssetMappings(2), 10));

    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await collection.executeFilter({
      boundingBox: new THREE.Box3().set(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 0.5, 0.5))
    });

    mockAssetMappings3D.verify(
      x =>
        x.list(
          It.IsAny(),
          It.IsAny(),
          It.Is<AssetMappings3DListFilter | undefined>(x =>
            isEqual(x?.intersectsBoundingBox, { min: [0, 0, 0], max: [0.5, 0.5, 0.5] })
          )
        ),
      Times.Once()
    );
  });

  test('executeFilter with assets filter, invokes callback for each chunk', async () => {
    mockAssetMappings3D
      .setup(x => x.list(It.IsAny(), It.IsAny(), It.IsAny()))
      .returnsAsync(createListResponse(createAssetMappings(8), 2));

    const assetsFilter = jest.fn((candidates: Asset[]) => Promise.resolve(candidates.filter((_, i) => i % 2 === 0)));

    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await collection.executeFilter({ assetsFilter });

    expect(assetsFilter).toBeCalledTimes(4);
    expect(collection.getIndexSet().toIndexArray()).toEqual([0, 2, 4, 6]);
  });

  test('getAreas() returns areas in ThreeJS coordinates', async () => {
    mockAssetMappings3D
      .setup(x => x.list(It.IsAny(), It.IsAny(), It.IsAny()))
      .returnsAsync(createListResponse(createAssetMappings(1), 10));
    mockNodeCollectionDataProvider
      .setup(x => x.mapBoxFromCdfToModelCoordinates(It.IsAny(), It.IsAny()))
      .callback(exp => {
        const box = exp.args[0] as THREE.Box3;
        const out = exp.args[1] as THREE.Box3;
        return out.copy(box).applyMatrix4(new THREE.Matrix4().makeTranslation(1, 2, 3));
      });

    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await collection.executeFilter({});

    const areas = [...collection.getAreas().areas()];
    expect(areas.length).toEqual(1);
    // Original is [<0,0,0>,<1,1,1>] - result should be translated
    expect(areas[0]).toEqual(new THREE.Box3(new THREE.Vector3(1, 2, 3), new THREE.Vector3(2, 3, 4)));
  });

  test('executeFilter with multiple assets and bounding box, throws', async () => {
    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await expect(() =>
      collection.executeFilter({ assetId: [1, 2, 3], boundingBox: new THREE.Box3() })
    ).rejects.toThrowError();
  });

  test('executeFilter with single asset, uses list endpoint', async () => {
    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await collection.executeFilter({ assetId: 1 });
    mockAssetMappings3D.verify(x => x.list(It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
  });

  test('executeFilter with multiple assets, uses filter endpoint', async () => {
    const collection = new AssetNodeCollection(mockClient.object(), mockNodeCollectionDataProvider.object());
    await collection.executeFilter({ assetId: [1, 2, 3, 4, 5] });
    mockAssetMappings3D.verify(x => x.filter(It.IsAny(), It.IsAny(), It.IsAny()), Times.Once());
  });
});

function createAssetMappings(count: number): AssetMapping3D[] {
  return [...new Array(count).keys()].map((_, i) => ({ assetId: i, nodeId: i, treeIndex: i, subtreeSize: 1 }));
}

function createNode(id: number): Node3D {
  const node: Node3D = {
    id,
    treeIndex: id,
    parentId: Math.floor(id / 2),
    depth: 1,
    name: `Node ${id}`,
    subtreeSize: 1,
    boundingBox: { min: [id, id, id], max: [id + 1, id + 1, id + 1] }
  };
  return node;
}

function createAsset(id: number): Asset {
  const asset: Asset = {
    rootId: 0,
    name: `Asset ${id}`,
    id,
    lastUpdatedTime: new Date(),
    createdTime: new Date()
  };
  return asset;
}
