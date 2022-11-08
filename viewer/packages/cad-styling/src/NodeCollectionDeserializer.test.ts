/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { IndexSet } from '@reveal/utilities';
import { Mock } from 'moq.ts';

import { createCadModel } from '../../../test-utilities/src/createCadModel';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { NodeCollectionDeserializer } from './NodeCollectionDeserializer';
import { SerializedNodeCollection } from './SerializedNodeCollection';
import { TreeIndexNodeCollection } from './TreeIndexNodeCollection';

describe(NodeCollectionDeserializer.name, () => {
  test('deserialize TreeIndexSet without option parameter', async () => {
    const sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      getToken: async () => 'dummy'
    });
    const deserializer = NodeCollectionDeserializer.Instance;

    const nodeCollection = new TreeIndexNodeCollection(new IndexSet([1, 3, 5]));

    const model = createCadModel(1, 2, 3, 3);

    const serializedCollection = nodeCollection.serialize();

    // Older TreeIndexNodeCollection in saved viewer state will have options undefined
    serializedCollection.options = undefined;

    expect(
      await deserializer.deserialize(sdk, model, {
        token: serializedCollection.token,
        state: serializedCollection.state,
        options: serializedCollection.options
      })
    ).toBeTruthy();
  });

  test('deserialize TreeIndexNodeCollection with areas', async () => {
    const deserializer = NodeCollectionDeserializer.Instance;

    const sdkMock = new Mock<CogniteClient>().object();
    const nodeCollectionProviderMock = new Mock<CdfModelNodeCollectionDataProvider>().object();
    const serializedNodeCollection: SerializedNodeCollection = {
      token: 'TreeIndexNodeCollection',
      state: [
        {
          from: 0,
          count: 3,
          toInclusive: 2
        }
      ],
      options: {
        areas: [
          {
            min: {
              x: 0,
              y: 0,
              z: 0
            },
            max: {
              x: 1,
              y: 1,
              z: 1
            }
          }
        ]
      }
    };
    const deserialize = deserializer.deserialize(sdkMock, nodeCollectionProviderMock, serializedNodeCollection);
    await expect(deserialize).resolves.not.toThrow();
  });
});
