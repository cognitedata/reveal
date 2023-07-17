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
  DefaultNodeAppearance
} from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Matrix4 } from 'three';
import { useSDK } from '../RevealContainer/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';

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
  const [model, setModel] = useState<CogniteCadModel>();
  const viewer = useReveal();
  const sdk = useSDK();

  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform, onLoad).catch(console.error);
    return removeModel;
  }, [modelId, revisionId, geometryFilter]);

  useEffect(() => {
    if (model === undefined || transform === undefined) return;
    model.setModelTransformation(transform);
  }, [transform, model]);

  useEffect(() => {
    if (model === undefined || styling === undefined) return;

    applyStyling(sdk, model, styling).catch(console.error);

    return () => {
      model.removeAllStyledNodeCollections();
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    };
  }, [styling, model]);

  return <></>;

  async function addModel(
    modelId: number,
    revisionId: number,
    transform?: Matrix4,
    onLoad?: (model: CogniteCadModel) => void
  ): Promise<CogniteCadModel> {
    const cadModel = await viewer.addCadModel({ modelId, revisionId });
    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    setModel(cadModel);
    onLoad?.(cadModel);

    return cadModel;
  }

  function removeModel(): void {
    if (model === undefined || !viewer.models.includes(model)) return;
    viewer.removeModel(model);
    setModel(undefined);
  }
}

async function applyStyling(
  sdk: CogniteClient,
  model: CogniteCadModel,
  styling?: CadModelStyling
): Promise<void> {
  if (styling === undefined) return;

  if (styling.defaultStyle !== undefined) {
    model.setDefaultNodeAppearance(styling.defaultStyle);
  }

  if (styling.groups !== undefined) {
    for (const group of styling.groups) {
      if ('treeIndices' in group && group.style !== undefined) {
        const nodes = new TreeIndexNodeCollection(group.treeIndices);
        model.assignStyledNodeCollection(nodes, group.style);
      } else if ('nodeIds' in group && group.style !== undefined) {
        const nodes = new NodeIdNodeCollection(sdk, model);
        await nodes.executeFilter(group.nodeIds);
        model.assignStyledNodeCollection(nodes, group.style);
      }
    }
  }
}
