/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useState, useRef } from 'react';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { Matrix4 } from 'three';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { useReveal3DResourcesCount } from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { isEqual } from 'lodash';
import { modelExists } from '../../utilities/modelExists';
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';
import { type CadModelStyling } from './types';
import { useApplyCadModelStyling } from './useApplyCadModelStyling';

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
        setRevealResourcesCount(getViewerResourceCount(viewer));
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
    const cadModel = await viewer.addCadModel(addModelOptions);

    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    setModel(cadModel);

    return cadModel;
  }

  function removeModel(): void {
    if (!modelExists(model, viewer)) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    viewer.removeModel(model);
    setRevealResourcesCount(getViewerResourceCount(viewer));
    setModel(undefined);
  }
}

function defaultLoadErrorHandler(addOptions: AddModelOptions, error: any): void {
  console.warn(
    `Failed to load (${addOptions.modelId}, ${addOptions.revisionId}): ${JSON.stringify(error)}`
  );
}
