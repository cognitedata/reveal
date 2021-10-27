/*!
 * Copyright 2021 Cognite AS
 */

// import { Cognite3DModel } from './Cognite3DModel';

// import { NodesLocalClient } from '@reveal/nodes-api';
// import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
// import { CadMaterialManager, CadNode } from '@reveal/rendering';
// import { CadModelMetadata } from '@reveal/cad-parsers';
// import { createCadModelMetadata, generateSectorTree } from '../../../../test-utilities';

// describe(Cognite3DModel.name, () => {
//   let model: Cognite3DModel;

//   beforeEach(() => {
//     const materialManager = new CadMaterialManager();
//     const cadRoot = generateSectorTree(3, 3);
//     const cadMetadata: CadModelMetadata = createCadModelMetadata(cadRoot);
//     materialManager.addModelMaterials(cadMetadata.modelIdentifier, cadMetadata.scene.maxTreeIndex);

//    const cadNode = new CadNode(cadMetadata, materialManager);
//    const apiClient = new NodesLocalClient();

//     model = new Cognite3DModel(1, 2, cadNode, apiClient);
//   });

//   test('(un)assignStyledNodeCollection maintains list of collections correctly', () => {
//     const collection = new TreeIndexNodeCollection();
//     model.assignStyledNodeCollection(collection, DefaultNodeAppearance.Highlighted);
//     expect(model.styledNodeCollections).not.toBeEmpty();
//     model.unassignStyledNodeCollection(collection);
//     expect(model.styledNodeCollections).toBeEmpty();
//   });
// });
