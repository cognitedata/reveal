/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { BoundingBox3D, CogniteClient, InternalId, Node3D, Revisions3DAPI } from '@cognite/sdk';
import { NodeIdNodeCollection } from './NodeIdNodeCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { NodeCollectionDeserializer } from './NodeCollectionDeserializer';

import range from 'lodash/range';

import { It, Mock, Times } from 'moq.ts';

describe(NodeIdNodeCollection.name, () => {
  let mockClient: Mock<CogniteClient>;
  let mockRevisions3DAPI: Mock<Revisions3DAPI>;
  let mockModel: Mock<CdfModelNodeCollectionDataProvider>;

  beforeEach(() => {
    mockClient = new Mock<CogniteClient>();
    mockRevisions3DAPI = new Mock<Revisions3DAPI>();
    mockRevisions3DAPI
      .setup(x => x.retrieve3DNodes(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(expression => {
        const ids: InternalId[] = expression.args[2];
        return Promise.resolve(ids.map(id => createNode3D(id)));
      });
    mockClient.setup(x => x.revisions3D).returns(mockRevisions3DAPI.object());

    mockModel = new Mock<CdfModelNodeCollectionDataProvider>();
    mockModel.setup(x => x.mapBoxFromCdfToModelCoordinates(It.IsAny(), It.IsAny())).returns(new THREE.Box3());
  });

  test('executeFilter with 1001 nodeIds, splits into two chunks', async () => {
    const collection = new NodeIdNodeCollection(mockClient.object(), mockModel.object());
    const ids = range(0, 1001);
    await expect(collection.executeFilter(ids)).resolves.not.toThrow();
    mockRevisions3DAPI.verify(x => x.retrieve3DNodes(It.IsAny(), It.IsAny(), It.IsAny()), Times.Exactly(2));
  });

  test('executeFilter with 0 nodes, does not trigger any requests', async () => {
    const collection = new NodeIdNodeCollection(mockClient.object(), mockModel.object());
    await collection.executeFilter([]);
    mockRevisions3DAPI.verify(x => x.retrieve3DNodes(It.IsAny(), It.IsAny(), It.IsAny()), Times.Never());
  });

  test('executeFilter populates IndexSet and areas', async () => {
    const collection = new NodeIdNodeCollection(mockClient.object(), mockModel.object());
    await collection.executeFilter([1, 2, 3]);
    expect(collection.getIndexSet().toIndexArray()).not.toBeEmpty();
    expect(collection.getAreas().isEmpty).toBeFalse();
  });

  test('executeFilter maps node bounds to ThreeJS coordinates', async () => {
    const collection = new NodeIdNodeCollection(mockClient.object(), mockModel.object());
    await collection.executeFilter([1, 2, 3]);
    mockModel.verify(x => x.mapBoxFromCdfToModelCoordinates(It.IsAny(), It.IsAny()), Times.Exactly(3));
  });

  test('deserialize serialized collection works', async () => {
    const collection = new NodeIdNodeCollection(mockClient.object(), mockModel.object());
    await collection.executeFilter([1, 2, 3]);
    const serialized = collection.serialize();

    const deserialized = await NodeCollectionDeserializer.Instance.deserialize(
      mockClient.object(),
      mockModel.object(),
      serialized
    );

    expect(deserialized.getIndexSet()).toEqual(collection.getIndexSet());
    expect(deserialized.getAreas()).toEqual(collection.getAreas());
  });
});

function createNode3D(id: InternalId): Node3D {
  const boundingBox: BoundingBox3D = {
    min: [1, 2, 3],
    max: [2, 3, 4]
  };
  const node: Node3D = {
    id: id.id,
    treeIndex: id.id,
    parentId: -1,
    depth: 0,
    name: `Node ${id.id}`,
    subtreeSize: 10,
    boundingBox
  };
  return node;
}
