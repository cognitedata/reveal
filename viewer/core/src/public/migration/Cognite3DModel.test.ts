/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { createCadModel } from '../../../../test-utilities/src/createCadModel';

describe(Cognite3DModel.name, () => {
  let model: Cognite3DModel;

  beforeEach(() => {
    model = createCadModel(1, 2, 3, 3);
  });

  test('(un)assignStyledNodeCollection maintains list of collections correctly', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);
    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.Outlined);

    expect(model.styledNodeCollections).not.toBeEmpty();

    model.unassignStyledNodeCollection(collection2);

    expect(model.styledNodeCollections).not.toBeEmpty();

    model.unassignStyledNodeCollection(collection);

    expect(model.styledNodeCollections).toBeEmpty();
  });

  test('removeAllStyledNodeCollections removes all styled node collections', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);
    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.Outlined);

    model.removeAllStyledNodeCollections();

    expect(model.styledNodeCollections).toBeEmpty();
  });
});
