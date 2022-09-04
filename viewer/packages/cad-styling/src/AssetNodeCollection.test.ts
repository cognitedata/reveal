/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import {
  AssetMapping3D,
  AssetMappings3DAPI,
  AssetMappings3DListFilter,
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
  let mockNodeCollectionDataProvider: Mock<CdfModelNodeCollectionDataProvider>;

  beforeEach(() => {
    mockAssetMappings3D = new Mock<AssetMappings3DAPI>();
    mockAssetMappings3D.setup(x => x.list(It.IsAny(), It.IsAny(), It.IsAny())).returnsAsync(createListResponse([], 10));

    mockRevisions3D = new Mock<Revisions3DAPI>();
    mockRevisions3D
      .setup(X => X.retrieve3DNodes(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(args => {
        const nodeIds = args.args[2] as InternalId[];
        return Promise.resolve(nodeIds.map(x => createNode(x.id)));
      });

    mockClient = new Mock<CogniteClient>();
    mockClient.setup(x => x.assetMappings3D).returns(mockAssetMappings3D.object());
    mockClient.setup(x => x.revisions3D).returns(mockRevisions3D.object());

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
    // mockNodeCollectionDataProvider
    //   .setup(x => x.modelId)
    //   .returns(42)
    //   .setup(x => x.revisionId)
    //   .returns(13);
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
