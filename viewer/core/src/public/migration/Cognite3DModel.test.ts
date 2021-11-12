/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';

import { createV8CadModel } from '../../../../test-utilities/src/createCadModel';

describe(Cognite3DModel.name, () => {
  let v8Model: Cognite3DModel;

  beforeEach(() => {
    v8Model = createV8CadModel(1, 2, 3, 3);
  });

  test('(un)assignStyledNodeCollection maintains list of collections correctly', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    v8Model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    v8Model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);
    v8Model.assignStyledNodeCollection(collection, DefaultNodeAppearance.Outlined);

    expect(v8Model.styledNodeCollections).not.toBeEmpty();

    v8Model.unassignStyledNodeCollection(collection2);

    expect(v8Model.styledNodeCollections).not.toBeEmpty();

    v8Model.unassignStyledNodeCollection(collection);

    expect(v8Model.styledNodeCollections).toBeEmpty();
  });

  test('removeAllStyledNodeCollections removes all styled node collections', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    v8Model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    v8Model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);
    v8Model.assignStyledNodeCollection(collection, DefaultNodeAppearance.Outlined);

    v8Model.removeAllStyledNodeCollections();

    expect(v8Model.styledNodeCollections).toBeEmpty();
  });
});
