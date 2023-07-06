/*!
 * Copyright 2023 Cognite AS
 */
import { type CognitePointCloudModel, type AddModelOptions, PointCloudAppearance, DefaultPointCloudAppearance, AnnotationIdPointCloudObjectCollection } from '@cognite/reveal';

import { useEffect, type ReactElement, useState } from 'react';
import { type Matrix4 } from 'three';
import { useReveal } from '../RevealContainer/RevealContext';

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
  onLoad?: () => void;
};

export function PointCloudContainer({
  addModelOptions,
  styling,
  transform,
  onLoad
}: CognitePointCloudModelProps): ReactElement {
  const [model, setModel] = useState<CognitePointCloudModel>();
  const viewer = useReveal();
  const { modelId, revisionId } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform).catch(console.error);
    return removeModel;
  }, [modelId, revisionId]);

  useEffect(() => {
    if (model === undefined || transform === undefined) return;
    model.setModelTransformation(transform);
  }, [transform]);

  useEffect(() => {
    if (model === undefined || styling === undefined) return;

    applyStyling(model, styling);

    return cleanStyling;
  }, [styling, model]);

  return <></>;

  async function addModel(modelId: number, revisionId: number, transform?: Matrix4): Promise<void> {
    const pointCloudModel = await viewer.addPointCloudModel({ modelId, revisionId });

    viewer.fitCameraToModel(pointCloudModel);

    if (transform !== undefined) {
      pointCloudModel.setModelTransformation(transform);
    }
    setModel(pointCloudModel);
    onLoad?.();
  }

  function removeModel(): void {
    if (model === undefined || !viewer.models.includes(model)) return;
    
    viewer.removeModel(model);
    setModel(undefined);
  }

  function cleanStyling(): void {
    if (model === undefined) return;

    model.setDefaultPointCloudAppearance(DefaultPointCloudAppearance);
    model.removeAllStyledObjectCollections();
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
