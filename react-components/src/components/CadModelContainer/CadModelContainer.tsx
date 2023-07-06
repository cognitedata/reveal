/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { NodeAppearance, type AddModelOptions, type CogniteCadModel, TreeIndexNodeCollection, NodeIdNodeCollection, DefaultNodeAppearance} from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Matrix4 } from 'three';
import { useSDK } from '../RevealContainer/SDKProvider';
import { CogniteClient } from '@cognite/sdk';

type NodeStylingGroup = {
  nodeIds: number[];
  style: NodeAppearance;
};

type TreeIndexStylingGroup = {
  treeIndices: number[];
  style: NodeAppearance;
};

type CadModelStyling = {
  defaultStyle?: NodeAppearance;
  groups?: (NodeStylingGroup | TreeIndexStylingGroup) []
};

type CogniteCadModelProps = {
  addModelOptions: AddModelOptions;
  styling?: CadModelStyling;
  transform?: Matrix4;
  onLoad?: () => void;
};

export default function CadModelContainer({
  addModelOptions,
  transform,
  styling,
  onLoad
}: CogniteCadModelProps): ReactElement {
  const modelRef = useRef<CogniteCadModel>();
  const viewer = useReveal();
  const sdk = useSDK();

  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform, onLoad).then((model) => applyStyling(sdk, model, styling)).catch(console.error);
    return removeModel;
  }, [modelId, revisionId, geometryFilter]);

  useEffect(() => {
    if (modelRef.current === undefined || transform === undefined) return;
    modelRef.current.setModelTransformation(transform);
  }, [transform]);

  useEffect(() => {
    const model = modelRef.current;

    if (model === undefined || styling === undefined) return;

    applyStyling(sdk, model, styling);
    
    return () => {
      model.removeAllStyledNodeCollections();
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    };
  }, [styling, modelRef.current]);

  return <></>;

  async function addModel(
    modelId: number,
    revisionId: number,
    transform?: Matrix4,
    onLoad?: () => void
  ): Promise<CogniteCadModel> {
    const cadModel = await viewer.addCadModel({ modelId, revisionId });
    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    modelRef.current = cadModel;
    onLoad?.();

    return cadModel;
  }

  function removeModel(): void {
    if (modelRef.current === undefined || !viewer.models.includes(modelRef.current)) return;
    viewer.removeModel(modelRef.current);
    modelRef.current = undefined;
  }
}

function applyStyling(sdk: CogniteClient, model: CogniteCadModel, styling?: CadModelStyling): void {
  if (styling === undefined) return;

  if (styling.defaultStyle !== undefined) {
    model.setDefaultNodeAppearance(styling.defaultStyle);
  }
  
  if (styling.groups !== undefined) {
    for (const group of styling.groups) {
      if ('treeIndices' in group) {
        const nodes = new TreeIndexNodeCollection(group.treeIndices);
        model.assignStyledNodeCollection(nodes, group.style);
      } else if ('nodeIds' in group) {
        const nodes = new NodeIdNodeCollection(sdk, model);
        nodes.executeFilter(group.nodeIds);
        model.assignStyledNodeCollection(nodes, group.style);
      }
    }
  }
}
