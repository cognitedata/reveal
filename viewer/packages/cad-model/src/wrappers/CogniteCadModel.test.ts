/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CogniteCadModel } from './CogniteCadModel';

import { DefaultNodeAppearance, NodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { NodesApiClient } from '@reveal/nodes-api';

import { MetricsLogger } from '@reveal/metrics';
import { createCadModel } from '../../../../test-utilities';
import { It, Mock } from 'moq.ts';

describe(CogniteCadModel.name, () => {
  let model: CogniteCadModel;
  let mockApiClient: Mock<NodesApiClient>;

  beforeAll(() => {
    MetricsLogger.init(false, '', '', {});
  });

  beforeEach(() => {
    mockApiClient = new Mock<NodesApiClient>();
    mockApiClient
      .setup(x => x.mapNodeIdsToTreeIndices(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(expression => {
        const nodeIds: number[] = expression.args[2];
        return Promise.resolve(nodeIds);
      });
    mockApiClient
      .setup(x => x.mapTreeIndicesToNodeIds(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(expression => {
        const treeIndices: number[] = expression.args[2];
        return Promise.resolve(treeIndices);
      });
    mockApiClient
      .setup(x => x.getBoundingBoxesByNodeIds(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(expression => {
        const nodeIds: number[] = expression.args[2];
        const bboxes = nodeIds.map(
          id => new THREE.Box3(new THREE.Vector3(id, id, id), new THREE.Vector3(id + 1, id + 1, id + 1))
        );
        return Promise.resolve(bboxes);
      });
    model = createCadModel(1, 2, 3, 3, mockApiClient.object());
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
    expect(model.styledNodeCollections).toEqual([
      { nodeCollection: collection, importance: 0, appearance: updatedAppearance }
    ]);
  });

  test('removeAllStyledNodeCollections removes all styled node collections', () => {
    const collection = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();

    model.assignStyledNodeCollection(collection, DefaultNodeAppearance.InFront);
    model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted);

    model.removeAllStyledNodeCollections();

    expect(model.styledNodeCollections).toBeEmpty();
  });

  test('styled node collections are kept in order of importance', () => {
    const collection1 = new TreeIndexNodeCollection();
    const collection2 = new TreeIndexNodeCollection();
    const collection3 = new TreeIndexNodeCollection();
    const collection4 = new TreeIndexNodeCollection();

    model.assignStyledNodeCollection(collection1, DefaultNodeAppearance.InFront, 0);
    model.assignStyledNodeCollection(collection2, DefaultNodeAppearance.Ghosted, 3);
    model.assignStyledNodeCollection(collection3, DefaultNodeAppearance.Hidden);
    model.assignStyledNodeCollection(collection4, DefaultNodeAppearance.Default, 0);

    expect(model.styledNodeCollections).toEqual([
      { nodeCollection: collection1, importance: 0, appearance: DefaultNodeAppearance.InFront },
      { nodeCollection: collection3, importance: 0, appearance: DefaultNodeAppearance.Hidden },
      { nodeCollection: collection4, importance: 0, appearance: DefaultNodeAppearance.Default },
      { nodeCollection: collection2, importance: 3, appearance: DefaultNodeAppearance.Ghosted }
    ]);
  });

  test('getBoundingBoxByTreeIndex() modifies out-parameter', async () => {
    const bbox = new THREE.Box3();
    const result = await model.getBoundingBoxByTreeIndex(1, bbox);
    expect(result).toBe(bbox);
    expect(result).not.toEqual(new THREE.Box3());
  });

  test('getBoundingBoxByNodeId() modifies out-parameter', async () => {
    const bbox = new THREE.Box3();
    const result = await model.getBoundingBoxByNodeId(1, bbox);
    expect(result).toBe(bbox);
    expect(result).not.toEqual(new THREE.Box3());
  });

  test('getBoundingBoxByNodeIds() modifies out-parameter', async () => {
    const result = await model.getBoundingBoxesByNodeIds([1, 2]);
    expect(result).toEqual(
      [1, 2].map(i => new THREE.Box3(new THREE.Vector3(i, i, i), new THREE.Vector3(i + 1, i + 1, i + 1)))
    );
  });

  test('setModelTransform() changes custom transform, not source transform', () => {
    const originalCustomTransform = model.getModelTransformation();
    const originalSourceTransform = model.getCdfToDefaultModelTransformation();

    const modifyingTransform = new THREE.Matrix4().setPosition(1, 2, 3);

    model.setModelTransformation(modifyingTransform);

    const newTransform = model.getModelTransformation();

    expect(originalCustomTransform).not.toEqual(newTransform);
    expect(newTransform).toEqual(modifyingTransform);

    expect(model.getCdfToDefaultModelTransformation()).toEqual(originalSourceTransform);
  });

  test('visible property hides or unhides model', () => {
    const visible = true;
    expect(model.visible).toBeTrue();

    model.visible = false;

    expect(model.cadNode.visible).not.toBe(visible);
    expect(model.visible).not.toBe(visible);

    model.visible = true;

    expect(model.cadNode.visible).toBe(visible);
    expect(model.visible).toBe(visible);
  });
});
