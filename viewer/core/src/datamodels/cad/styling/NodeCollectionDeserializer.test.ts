/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { TreeIndexNodeCollection } from '@reveal/cad-styling';
import { IndexSet } from '@reveal/utilities';
import { createCadModel } from '../../../../../test-utilities/src/createCadModel';
import { NodeCollectionDeserializer } from './NodeCollectionDeserializer';

describe('NodeCollectionDeserializer', () => {
  test('deserialize TreeIndexSet without option parameter', async () => {
    const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
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
});
