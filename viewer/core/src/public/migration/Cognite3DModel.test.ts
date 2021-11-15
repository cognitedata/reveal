/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { MetricsLogger } from '@reveal/metrics';

import { createCadModel } from '../../../../test-utilities/src/createCadModel';

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

  test('assignStyledNodeCollection same collection twice throws', () => {
    const collection = new TreeIndexNodeCollection();
    model.assignStyledNodeCollection(collection, { renderGhosted: true });
    expect(() => model.assignStyledNodeCollection(collection, { renderInFront: false })).toThrowError();
  });

  test('updateStyledNodeCollection throw is collection has not been added', () => {
    const collection = new TreeIndexNodeCollection();

    expect(() => model.updateStyledNodeCollection(collection, { renderInFront: false })).toThrowError();

    model.assignStyledNodeCollection(collection, { renderGhosted: true });
    expect(() => model.updateStyledNodeCollection(collection, { renderInFront: false })).not.toThrowError();

    model.unassignStyledNodeCollection(collection);
    expect(() => model.updateStyledNodeCollection(collection, { renderInFront: false })).toThrowError();
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
