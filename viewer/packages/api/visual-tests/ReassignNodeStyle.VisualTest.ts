/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { IndexSet } from '@reveal/utilities';
import { CogniteCadModel } from '..';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

function createAlternatingIndexSet(nodeCount: number): IndexSet {
  const indexSet = new IndexSet();

  for (let i = 0; i < nodeCount; i += 2) {
    indexSet.add(i);
  }

  return indexSet;
}

function createFirstTreeIndicesSet(nodeCount: number): IndexSet {
  const indexSet = new IndexSet();

  for (let i = 0; i < nodeCount / 2; i++) {
    indexSet.add(i);
  }

  return indexSet;
}

export default class ReassignNodeStyleVisualTest extends ViewerVisualTestFixture {
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { models } = testFixtureComponents;

    const model = models[0];
    if (!(model instanceof CogniteCadModel)) {
      return Promise.resolve();
    }

    const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 4, 0, 0));
    model.setModelTransformation(matrix);

    const alternatingIndexSet = createAlternatingIndexSet(model.nodeCount);
    const invertedRanges = alternatingIndexSet.invertedRanges();
    const invertedSet = new IndexSet();

    const firstTreeIndicesSet = createFirstTreeIndicesSet(model.nodeCount);

    for (const invertedRange of invertedRanges) {
      invertedSet.addRange(invertedRange);
    }

    const alternatingNodeCollection = new TreeIndexNodeCollection(alternatingIndexSet);
    const invertedNodeCollection = new TreeIndexNodeCollection(invertedSet);
    const firstIndicesNodeCollection = new TreeIndexNodeCollection(firstTreeIndicesSet);

    model.assignStyledNodeCollection(alternatingNodeCollection, DefaultNodeAppearance.Highlighted);

    model.assignStyledNodeCollection(firstIndicesNodeCollection, DefaultNodeAppearance.Ghosted);
    model.assignStyledNodeCollection(invertedNodeCollection, DefaultNodeAppearance.Default);

    model.assignStyledNodeCollection(alternatingNodeCollection, DefaultNodeAppearance.Outlined);
    return Promise.resolve();
  }
}
