/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

import { NodesLocalClient } from '@reveal/nodes-api';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { CadMaterialManager, CadNode } from '@reveal/rendering';
import { CadModelMetadata } from '@reveal/cad-parsers';
import { MetricsLogger } from '@reveal/metrics';
import { createCadModelMetadata, generateV8SectorTree } from '../../../../test-utilities';
import { V8SectorRepository } from '@reveal/sector-loader';
import { Mock } from 'moq.ts';
import { BinaryFileProvider } from '@reveal/modeldata-api';

describe(Cognite3DModel.name, () => {
  let model: Cognite3DModel;

  beforeAll(() => {
    MetricsLogger.init(false, '', '', {});
  });

  beforeEach(() => {
    const materialManager = new CadMaterialManager();
    const mockBinaryFileProvider = new Mock<BinaryFileProvider>();
    const sectorRepository = new V8SectorRepository(mockBinaryFileProvider.object(), materialManager);
    const cadRoot = generateV8SectorTree(3, 3);
    const cadMetadata: CadModelMetadata = createCadModelMetadata(cadRoot);
    materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

    const cadNode = new CadNode(cadMetadata, materialManager, sectorRepository);
    const apiClient = new NodesLocalClient();

    model = new Cognite3DModel(1, 2, cadNode, apiClient);
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
