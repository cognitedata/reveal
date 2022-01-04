/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

import { DefaultNodeAppearance, NodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';

import { MetricsLogger } from '@reveal/metrics';
import { createCadModel } from '../../../../test-utilities';

describe(Cognite3DModel.name, () => {
  let model: Cognite3DModel;

  beforeAll(() => {
    MetricsLogger.init(false, '', '', {});
  });

  beforeEach(() => {
    model = createCadModel(1, 2, 3, 3);
  });

  test('(un)assignStyledNodeCollection maintains list of collections correctly', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);

    expect(model.styledNodeCollections).not.toBeEmpty();

    model.unassignStyledNodeCollection(collection2);

    expect(model.styledNodeCollections).not.toBeEmpty();

    model.unassignStyledNodeCollection(collection);

    expect(model.styledNodeCollections).toBeEmpty();
  });

  test('assignStyledNodeCollection updates style if called twice with same collection', () => {
    const originalAppearance: NodeAppearance = { renderGhosted: true };
    const updatedAppearance: NodeAppearance = { renderInFront: true, renderGhosted: false };
    const collection = new TreeIndexNodeCollection();
    model.assignStyledNodeCollection(collection, originalAppearance);
    model.assignStyledNodeCollection(collection, updatedAppearance);
    expect(model.styledNodeCollections).toEqual([{ nodeCollection: collection, appearance: updatedAppearance }]);
  });

  test('removeAllStyledNodeCollections removes all styled node collections', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);

    model.removeAllStyledNodeCollections();

    expect(model.styledNodeCollections).toBeEmpty();
  });
});
