/*!
 * Copyright 2023 Cognite AS
 */
import { type CognitePointCloudModel, type AddModelOptions } from '@cognite/reveal';

import { useEffect, type ReactElement, useState, useRef } from 'react';
import { Matrix4 } from 'three';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { useReveal3DResourcesCount } from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { cloneDeep, isEqual } from 'lodash';
import {
  useApplyPointCloudStyling,
  type PointCloudModelStyling
} from './useApplyPointCloudStyling';
import { modelExists } from '../../utilities/modelExists';
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';

export type CognitePointCloudModelProps = {
  addModelOptions: AddModelOptions;
  styling?: PointCloudModelStyling;
  transform?: Matrix4;
  onLoad?: (model: CognitePointCloudModel) => void;
  onLoadError?: (options: AddModelOptions, error: any) => void;
};

export function PointCloudContainer({
  addModelOptions,
  styling,
  transform,
  onLoad,
  onLoadError
}: CognitePointCloudModelProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const [model, setModel] = useState<CognitePointCloudModel | undefined>(undefined);
  const viewer = useReveal();
  const { modelId, revisionId } = addModelOptions;
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const initializingModel = useRef<AddModelOptions | undefined>(undefined);

  useEffect(() => {
    if (isEqual(initializingModel.current, addModelOptions)) {
      return;
    }

    initializingModel.current = cloneDeep(addModelOptions);

    addModel(modelId, revisionId, transform)
      .then((pointCloudModel) => {
        onLoad?.(pointCloudModel);
        setRevealResourcesCount(getViewerResourceCount(viewer));
      })
      .catch((error) => {
        const errorHandler = onLoadError ?? defaultLoadErrorHandler;
        errorHandler(addModelOptions, error);
      });
  }, [modelId, revisionId]);

  useEffect(() => {
    if (!modelExists(model, viewer) || transform === undefined) return;

    model.setModelTransformation(transform);
  }, [transform, model]);

  useApplyPointCloudStyling(model, styling);

  useEffect(() => removeModel, [model]);

  return <></>;

  async function addModel(
    modelId: number,
    revisionId: number,
    transform?: Matrix4
  ): Promise<CognitePointCloudModel> {
    const pointCloudModel = await getOrAddModel();

    if (transform !== undefined) {
      pointCloudModel.setModelTransformation(transform);
    }
    setModel(pointCloudModel);
    return pointCloudModel;

    async function getOrAddModel(): Promise<CognitePointCloudModel> {
      const viewerModel = viewer.models.find(
        (model) =>
          model.modelId === modelId &&
          model.revisionId === revisionId &&
          model.getModelTransformation().equals(transform ?? new Matrix4())
      );
      if (viewerModel !== undefined) {
        return await Promise.resolve(viewerModel as CognitePointCloudModel);
      }
      return await viewer.addPointCloudModel({ modelId, revisionId });
    }
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
