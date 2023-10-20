/*!
 * Copyright 2023 Cognite AS
 */
import {
  type CognitePointCloudModel,
  type AddModelOptions,
  type PointCloudAppearance,
  DefaultPointCloudAppearance,
  AnnotationIdPointCloudObjectCollection
} from '@cognite/reveal';

import { useEffect, type ReactElement, useState, useRef } from 'react';
import { Matrix4 } from 'three';
import { useReveal } from '../RevealContainer/RevealContext';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { useReveal3DResourcesCount } from '../Reveal3DResources/Reveal3DResourcesCountContext';
import { useLayersUrlParams } from '../../hooks/useUrlStateParam';
import { cloneDeep, isEqual } from 'lodash';

export type AnnotationIdStylingGroup = {
  annotationIds: number[];
  style: PointCloudAppearance;
};

export type PointCloudModelStyling = {
  defaultStyle?: PointCloudAppearance;
  groups?: AnnotationIdStylingGroup[];
};

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
  const [model, setModel] = useState<CognitePointCloudModel>();
  const viewer = useReveal();
  const { modelId, revisionId } = addModelOptions;
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const [layersUrlState] = useLayersUrlParams();
  const { pointCloudLayers } = layersUrlState;
  const initializingModel = useRef<AddModelOptions | undefined>(undefined);

  useEffect(() => {
    if (isEqual(initializingModel.current, addModelOptions)) {
      return;
    }

    initializingModel.current = cloneDeep(addModelOptions);

    addModel(modelId, revisionId, transform)
      .then((pointCloudModel) => {
        onLoad?.(pointCloudModel);
        setRevealResourcesCount(viewer.models.length);
        applyLayersState(pointCloudModel);
      })
      .catch((error) => {
        const errorHandler = onLoadError ?? defaultLoadErrorHandler;
        errorHandler(addModelOptions, error);
      });
  }, [modelId, revisionId]);

  useEffect(() => {
    if (model === undefined || transform === undefined) return;
    model.setModelTransformation(transform);
  }, [transform, model]);

  useEffect(() => {
    if (model === undefined || styling === undefined) return;

    applyStyling(model, styling);

    return cleanStyling;
  }, [styling, model]);

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
    if (model === undefined || !viewer.models.includes(model)) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    viewer.removeModel(model);
    setModel(undefined);
  }

  function cleanStyling(): void {
    if (model === undefined || !viewer.models.includes(model)) return;

    model.setDefaultPointCloudAppearance(DefaultPointCloudAppearance);
    model.removeAllStyledObjectCollections();
  }

  function applyLayersState(model: CognitePointCloudModel): void {
    if (pointCloudLayers === undefined) {
      return;
    }
    const index = viewer.models.indexOf(model);
    const urlLayerState = pointCloudLayers.find(
      (layer) => layer.revisionId === revisionId && layer.index === index
    );
    urlLayerState !== undefined &&
      model.setDefaultPointCloudAppearance({ visible: urlLayerState.applied });
  }
}

function applyStyling(model: CognitePointCloudModel, styling: PointCloudModelStyling): void {
  if (styling.defaultStyle !== undefined) {
    model.setDefaultPointCloudAppearance(styling.defaultStyle);
  }

  if (styling.groups !== undefined) {
    for (const group of styling.groups) {
      if (group.annotationIds !== undefined) {
        const collection = new AnnotationIdPointCloudObjectCollection(group.annotationIds);

        model.assignStyledObjectCollection(collection, group.style);
      }
    }
  }
}

function defaultLoadErrorHandler(addOptions: AddModelOptions, error: any): void {
  console.warn(
    `Failed to load (${addOptions.modelId}, ${addOptions.revisionId}): ${JSON.stringify(error)}`
  );
}
