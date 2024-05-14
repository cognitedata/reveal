/*!
 * Copyright 2024 Cognite AS
 */

import {
  DefaultNodeAppearance,
  type CognitePointCloudModel,
  type PointCloudAppearance,
  AnnotationIdPointCloudObjectCollection
} from '@cognite/reveal';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { useEffect } from 'react';
import { modelExists } from '../../utilities/modelExists';

export type AnnotationIdStylingGroup = {
  annotationIds: number[];
  style: PointCloudAppearance;
};

export type PointCloudModelStyling = {
  defaultStyle?: PointCloudAppearance;
  groups?: AnnotationIdStylingGroup[];
};

export const useApplyPointCloudStyling = (
  model?: CognitePointCloudModel,
  modelStyling?: PointCloudModelStyling
): void => {
  const viewer = useReveal();

  const defaultStyle = modelStyling?.defaultStyle ?? DefaultNodeAppearance.Default;
  const styleGroups = modelStyling?.groups;

  useEffect(() => {
    if (!modelExists(model, viewer) || styleGroups === undefined) return;

    applyStyling(model, styleGroups);
  }, [styleGroups, model]);

  useEffect(() => {
    if (!modelExists(model, viewer)) return;

    model.setDefaultPointCloudAppearance(defaultStyle);
  }, [defaultStyle, model]);
};

function applyStyling(model: CognitePointCloudModel, styling: AnnotationIdStylingGroup[]): void {
  if (styling !== undefined) {
    if ( model.styledCollections.length > 0) {
      model.removeAllStyledObjectCollections();
    }
    for (const group of styling) {
      if (group.annotationIds !== undefined) {
        const collection = new AnnotationIdPointCloudObjectCollection(group.annotationIds);

        model.assignStyledObjectCollection(collection, group.style);
      }
    }
  }
}
