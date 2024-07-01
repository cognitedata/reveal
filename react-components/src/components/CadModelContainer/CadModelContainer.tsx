/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useState, useRef } from 'react';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { Matrix4 } from 'three';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type CadModelStyling, useApplyCadModelStyling } from './useApplyCadModelStyling';
import { useReveal3DResourcesCount } from '../Reveal3DResources/Reveal3DResourcesCountContext';
import { isEqual } from 'lodash';
import { modelExists } from '../../utilities/modelExists';

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
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const initializingModel = useRef<AddModelOptions | undefined>(undefined);

  const [model, setModel] = useState<CogniteCadModel | undefined>(undefined);

  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    if (isEqual(initializingModel.current, addModelOptions)) {
      return;
    }

    initializingModel.current = addModelOptions;
    addModel(addModelOptions, transform)
      .then((model) => {
        onLoad?.(model);
        setRevealResourcesCount(viewer.models.length + viewer.get360ImageCollections().length);
      })
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
    addModelOptions: AddModelOptions,
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
      return await viewer.addCadModel(addModelOptions);
    }
  }

  function removeModel(): void {
    if (!modelExists(model, viewer)) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    viewer.removeModel(model);
    setRevealResourcesCount(viewer.models.length + viewer.get360ImageCollections().length);
    setModel(undefined);
  }
}

function defaultLoadErrorHandler(addOptions: AddModelOptions, error: any): void {
  console.warn(
    `Failed to load (${addOptions.modelId}, ${addOptions.revisionId}): ${JSON.stringify(error)}`
  );
}
