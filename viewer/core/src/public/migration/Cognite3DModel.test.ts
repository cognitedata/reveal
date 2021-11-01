/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { createCadModel } from 'test-utilities/src/createCadModel';

describe(Cognite3DModel.name, () => {
  let model: Cognite3DModel;

  beforeEach(() => {

    model = createCadModel(1, 2, 3, 3);
  });

  test('(un)assignStyledNodeCollection maintains list of collections correctly', () => {
    const collection = new TreeIndexNodeCollection();
    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.Highlighted);
    expect(model.styledNodeCollections).not.toBeEmpty();
    model.unassignStyledNodeCollection(collection);
    expect(model.styledNodeCollections).toBeEmpty();
  });
});
