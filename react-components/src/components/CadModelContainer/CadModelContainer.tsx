/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useState } from 'react';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { Matrix4 } from 'three';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import {
  type CadModelStyling,
  useApplyCadModelStyling,
  modelExists
} from './useApplyCadModelStyling';

export type CogniteCadModelProps = {
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
  const viewer = useReveal();

  const [model, setModel] = useState<CogniteCadModel | undefined>(
    viewer.models.find(
      (m) => m.modelId === addModelOptions.modelId && m.revisionId === addModelOptions.revisionId
    ) as CogniteCadModel | undefined
  );

  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform, onLoad).catch(console.error);
  }, [modelId, revisionId, geometryFilter]);

  useEffect(() => {
    if (!modelExists(model, viewer) || transform === undefined) return;

    model.setModelTransformation(transform);
  }, [transform, model]);

  useApplyCadModelStyling(model, styling);

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
