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
import { useRevealResources } from '../RevealContainer/RevealResourcesContext';

export type CogniteCadModelProps = {
  addModelOptions: AddModelOptions;
  styling?: CadModelStyling;
  transform?: Matrix4;
  onLoad?: (model: CogniteCadModel) => void;
  onLoadError?: (options: AddModelOptions, error: any) => void;
};

export function CadModelContainer({
  addModelOptions,
  transform,
  styling,
  onLoad,
  onLoadError
}: CogniteCadModelProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const viewer = useReveal();
  const { update3DResources } = useRevealResources();

  const [model, setModel] = useState<CogniteCadModel | undefined>(
    viewer.models.find(
      (m) => m.modelId === addModelOptions.modelId && m.revisionId === addModelOptions.revisionId
    ) as CogniteCadModel | undefined
  );

  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform)
      .then((model) => { onLoad?.(model); update3DResources(viewer.models) })
      .catch((error) => {
        const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
        errorReportFunction(addModelOptions, error);
      });
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
    transform?: Matrix4
  ): Promise<CogniteCadModel> {
    const cadModel = await getOrAddModel();

    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    setModel(cadModel);

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

function defaultLoadErrorHandler(addOptions: AddModelOptions, error: any): void {
  console.warn(
    `Failed to load (${addOptions.modelId}, ${addOptions.revisionId}): ${JSON.stringify(error)}`
  );
}
