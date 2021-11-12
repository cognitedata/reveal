/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';

import { createV8CadModel } from '../../../../test-utilities/src/createCadModel';

import { initMetrics } from '@reveal/metrics';

describe(Cognite3DModel.name, () => {
  let v8Model: Cognite3DModel;

  beforeAll(() => {
    initMetrics(false, '', '', {});
  });

  beforeEach(() => {
    v8Model = createV8CadModel(1, 2, 3, 3);
  });

  test('(un)assignStyledNodeCollection maintains list of collections correctly', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    v8Model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    v8Model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);

    expect(v8Model.styledNodeCollections).not.toBeEmpty();

    v8Model.unassignStyledNodeCollection(collection2);

    expect(v8Model.styledNodeCollections).not.toBeEmpty();

    v8Model.unassignStyledNodeCollection(collection);

    expect(v8Model.styledNodeCollections).toBeEmpty();
  });

  test('assignStyledNodeCollection same collection twice throws', () => {
    const collection = new TreeIndexNodeCollection();
    v8Model.assignStyledNodeCollection(collection, { renderGhosted: true });
    expect(() => v8Model.assignStyledNodeCollection(collection, { renderInFront: false })).toThrowError();
  });

  test('updateStyledNodeCollection throw is collection has not been added', () => {
    const collection = new TreeIndexNodeCollection();

    expect(() => v8Model.updateStyledNodeCollection(collection, { renderInFront: false })).toThrowError();

    v8Model.assignStyledNodeCollection(collection, { renderGhosted: true });
    expect(() => v8Model.updateStyledNodeCollection(collection, { renderInFront: false })).not.toThrowError();

    v8Model.unassignStyledNodeCollection(collection);
    expect(() => v8Model.updateStyledNodeCollection(collection, { renderInFront: false })).toThrowError();
  });

  test('removeAllStyledNodeCollections removes all styled node collections', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    v8Model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    v8Model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);

    v8Model.removeAllStyledNodeCollections();

    expect(v8Model.styledNodeCollections).toBeEmpty();
  });
});
