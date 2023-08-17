/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useState } from 'react';
import {
  type NodeAppearance,
  type AddModelOptions,
  type CogniteCadModel,
  TreeIndexNodeCollection,
  NodeIdNodeCollection,
  DefaultNodeAppearance,
  type NodeCollection,
  type Cognite3DViewer
} from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { Matrix4 } from 'three';
import { useSDK } from '../RevealContainer/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { isEqual } from 'lodash';

export type NodeStylingGroup = {
  nodeIds: number[];
  style?: NodeAppearance;
};

export type TreeIndexStylingGroup = {
  treeIndices: number[];
  style?: NodeAppearance;
};

export type CadModelStyling = {
  defaultStyle?: NodeAppearance;
  groups?: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

type CogniteCadModelProps = {
  addModelOptions: AddModelOptions;
  styling?: CadModelStyling;
  transform?: Matrix4;
  onLoad?: (model: CogniteCadModel) => void;
};

export function CadModelContainer({
  addModelOptions,
  transform,
  styling,
  onLoad
}: CogniteCadModelProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const [model, setModel] = useState<CogniteCadModel>();

  const viewer = useReveal();
  const sdk = useSDK();

  const defaultStyle = styling?.defaultStyle ?? DefaultNodeAppearance.Default;
  const styleGroups = styling?.groups;

  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform, onLoad).catch(console.error);
  }, [modelId, revisionId, geometryFilter]);

  useEffect(() => {
    if (!modelExists(model, viewer) || transform === undefined) return;
    model.setModelTransformation(transform);
  }, [transform, model]);

  useEffect(() => {
    if (!modelExists(model, viewer) || styleGroups === undefined) return;
    void applyStyling(sdk, model, styleGroups);
  }, [styleGroups, model]);

  useEffect(() => {
    if (!modelExists(model, viewer)) return;
    model.setDefaultNodeAppearance(defaultStyle);
    return () => {
      if (!modelExists(model, viewer)) {
        return;
      }
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    };
  }, [defaultStyle, model]);

  useEffect(() => removeModel, [model]);

  return <></>;

  async function addModel(
    modelId: number,
    revisionId: number,
    transform?: Matrix4,
    onLoad?: (model: CogniteCadModel) => void
  ): Promise<CogniteCadModel> {
    const cadModel = await getOrAddModel();
    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    setModel(cadModel);
    onLoad?.(cadModel);

    return cadModel;

    async function getOrAddModel(): Promise<CogniteCadModel> {
      const viewerModel = viewer.models.find(
        (model) =>
          model.modelId === modelId &&
          model.revisionId === revisionId &&
          model.getModelTransformation().equals(transform ?? new Matrix4())
      );
      if (viewerModel !== undefined) {
        return await Promise.resolve(viewerModel as CogniteCadModel);
      }
      return await viewer.addCadModel({ modelId, revisionId });
    }
  }

  function removeModel(): void {
    if (!modelExists(model, viewer)) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    viewer.removeModel(model);
    setModel(undefined);
  }
}

async function applyStyling(
  sdk: CogniteClient,
  model: CogniteCadModel,
  stylingGroups: Array<NodeStylingGroup | TreeIndexStylingGroup>
): Promise<NodeCollection[]> {
  const collections: NodeCollection[] = [];

  const dirtyIndex = await getDirtyIndex();

  for (let i = dirtyIndex; i < model.styledNodeCollections.length; i++) {
    const viewerStyledNodeCollection = model.styledNodeCollections[i];
    model.unassignStyledNodeCollection(viewerStyledNodeCollection.nodeCollection);
  }

  for (let i = dirtyIndex; i < stylingGroups.length; i++) {
    const stylingGroup = stylingGroups[i];
    if ('treeIndices' in stylingGroup && stylingGroup.style !== undefined) {
      const nodes = new TreeIndexNodeCollection(stylingGroup.treeIndices);
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
      collections.push(nodes);
    } else if ('nodeIds' in stylingGroup && stylingGroup.style !== undefined) {
      const nodes = new NodeIdNodeCollection(sdk, model);
      await nodes.executeFilter(stylingGroup.nodeIds);
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
      collections.push(nodes);
    }
  }
  return collections;

  async function getDirtyIndex(): Promise<number> {
    for (let i = 0; i < model.styledNodeCollections.length; i++) {
      const stylingGroup = stylingGroups[i];
      const viewerStyledNodeCollection = model.styledNodeCollections[i];
      const areEqual = await areStylesEqual(viewerStyledNodeCollection, stylingGroup);
      if (!areEqual) {
        return i;
      }
    }
    return model.styledNodeCollections.length;
  }
}

function modelExists(
  model: CogniteCadModel | undefined,
  viewer: Cognite3DViewer
): model is CogniteCadModel {
  return model !== undefined && viewer.models.includes(model);
}

async function areStylesEqual(
  styledNodeCollection: {
    nodeCollection: NodeCollection;
    appearance: NodeAppearance;
  },
  stylingGroup: NodeStylingGroup | TreeIndexStylingGroup
): Promise<boolean> {
  const groupStyle = stylingGroup?.style;
  if (groupStyle === undefined) return false;

  const viewerStyle = styledNodeCollection.appearance;

  if (!isEqual(viewerStyle, groupStyle)) {
    return false;
  }

  const viewerCollection = styledNodeCollection.nodeCollection;

  if (isNodeStylingGroup(stylingGroup) && viewerCollection instanceof NodeIdNodeCollection) {
    return isEqual(stylingGroup.nodeIds, viewerCollection.serialize().state.nodeIds);
  } else if (
    !isNodeStylingGroup(stylingGroup) &&
    viewerCollection instanceof TreeIndexNodeCollection
  ) {
    return isEqual(stylingGroup.treeIndices, viewerCollection.getIndexSet());
  }

  return false;

  function isNodeStylingGroup(
    stylingGroup: NodeStylingGroup | TreeIndexStylingGroup
  ): stylingGroup is NodeStylingGroup {
    return 'nodeIds' in stylingGroup;
  }
}
