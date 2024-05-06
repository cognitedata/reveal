/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CogniteCadModel,
  type IndexSet,
  type NodeAppearance,
  type NodeCollection,
  NodeIdNodeCollection,
  TreeIndexNodeCollection,
  type Cognite3DViewer
} from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { isEqual } from 'lodash';
import { type StyledCadModelAddOptions } from './calculateCadModelsStyling';
import { modelExists } from '../../utilities/modelExists';

export type NodeStylingGroup = {
  nodeIds: number[];
  style?: NodeAppearance;
};

export type TreeIndexStylingGroup = {
  treeIndexSet: IndexSet;
  style?: NodeAppearance;
};

export type CadModelStyling = {
  defaultStyle?: NodeAppearance;
  groups?: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

export async function applyCadStyling(
  model: CogniteCadModel,
  addOptions: StyledCadModelAddOptions,
  viewer: Cognite3DViewer,
  sdk: CogniteClient
): Promise<void> {
  if (!modelExists(model, viewer)) {
    return;
  }

  const stylingGroups = addOptions.styleGroups;
  const firstChangeIndex = await getFirstChangeIndex();
  model.setDefaultNodeAppearance(addOptions.defaultStyle);

  for (let i = firstChangeIndex; i < model.styledNodeCollections.length; i++) {
    const viewerStyledNodeCollection = model.styledNodeCollections[i];
    model.unassignStyledNodeCollection(viewerStyledNodeCollection.nodeCollection);
  }

  for (let i = firstChangeIndex; i < stylingGroups.length; i++) {
    const stylingGroup = stylingGroups[i];

    if (stylingGroup.style === undefined) continue;

    if ('treeIndexSet' in stylingGroup) {
      const nodes = new TreeIndexNodeCollection(stylingGroup.treeIndexSet);
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
    }

    if ('nodeIds' in stylingGroup) {
      const nodes = new NodeIdNodeCollection(sdk, model);
      await nodes.executeFilter(stylingGroup.nodeIds);
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
    }
  }

  async function getFirstChangeIndex(): Promise<number> {
    for (let i = 0; i < model.styledNodeCollections.length; i++) {
      const stylingGroup = stylingGroups[i];
      const viewerStyledNodeCollection = model.styledNodeCollections[i];

      const isUpToDate = await isEqualOrUpdated(stylingGroup, viewerStyledNodeCollection);

      if (!isUpToDate) {
        return i;
      }
    }

    return model.styledNodeCollections.length;
  }
}

async function isEqualOrUpdated(
  group: NodeStylingGroup | TreeIndexStylingGroup,
  collection: {
    nodeCollection: NodeCollection;
    appearance: NodeAppearance;
  }
): Promise<boolean> {
  if (group?.style === undefined) return false;

  const isEqualGroupStyle = isEqualStyle(collection.appearance, group.style);

  if (!isEqualGroupStyle) return false;

  updateIfTreeIndexCollection();

  await updateIfNodeIdCollection();

  return true;

  async function updateIfNodeIdCollection(): Promise<void> {
    if (!(collection.nodeCollection instanceof NodeIdNodeCollection) || !('nodeIds' in group)) {
      return;
    }
    const collectionNodeIds = collection.nodeCollection.serialize().state.nodeIds as number[];
    const isEqualContent = isEqual(collectionNodeIds, group.nodeIds);

    if (!isEqualContent) {
      return;
    }

    await collection.nodeCollection.executeFilter(group.nodeIds);
  }

  function updateIfTreeIndexCollection(): void {
    if (
      !(collection.nodeCollection instanceof TreeIndexNodeCollection) ||
      !('treeIndexSet' in group)
    ) {
      return;
    }

    const compareCollection = new TreeIndexNodeCollection(group.treeIndexSet);

    const isEqualContent = isEqualTreeIndex(collection.nodeCollection, compareCollection);

    if (isEqualContent) {
      return;
    }
    collection.nodeCollection.updateSet(group.treeIndexSet);
  }
}

function isEqualTreeIndex(
  collectionA: TreeIndexNodeCollection,
  collectionB: TreeIndexNodeCollection
): boolean {
  const setA = collectionA.getIndexSet();
  const setB = collectionB.getIndexSet();

  const setBContainsSetA = setA.clone().differenceWith(setB).count === 0;
  return setBContainsSetA && setA.count === setB.count;
}

function isEqualStyle(styleA: NodeAppearance, styleB: NodeAppearance): boolean {
  const { color: colorA, ...restA } = styleA;
  const { color: colorB, ...restB } = styleB;

  const color =
    colorA === undefined || colorB === undefined
      ? Boolean(colorA ?? colorB)
      : colorA.equals(colorB);

  return color && isEqual(restA, restB);
}
