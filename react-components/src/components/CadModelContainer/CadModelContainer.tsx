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
    const stylingCollections = applyStyling(sdk, model, styleGroups);

    return () => {
      if (!modelExists(model, viewer)) return;
      void stylingCollections.then((nodeCollections) => {
        nodeCollections.forEach((nodeCollection) => {
          model.unassignStyledNodeCollection(nodeCollection);
        });
      });
    };
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
  for (const group of stylingGroups) {
    if ('treeIndices' in group && group.style !== undefined) {
      const nodes = new TreeIndexNodeCollection(group.treeIndices);
      model.assignStyledNodeCollection(nodes, group.style);
      collections.push(nodes);
    } else if ('nodeIds' in group && group.style !== undefined) {
      const nodes = new NodeIdNodeCollection(sdk, model);
      await nodes.executeFilter(group.nodeIds);
      model.assignStyledNodeCollection(nodes, group.style);
      collections.push(nodes);
    }
  }
  return collections;
}

function modelExists(
  model: CogniteCadModel | undefined,
  viewer: Cognite3DViewer
): model is CogniteCadModel {
  return model !== undefined && viewer.models.includes(model);
}
