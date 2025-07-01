import {
  DefaultNodeAppearance,
  type CognitePointCloudModel,
  AnnotationIdPointCloudObjectCollection,
  PointCloudDMVolumeCollection,
  type DataSourceType
} from '@cognite/reveal';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { useEffect } from 'react';
import { modelExists } from '../../utilities/modelExists';
import { type PointCloudVolumeStylingGroup, type PointCloudModelStyling } from './types';
import { isPointCloudVolumesAnnotation, isPointCloudVolumesDMInstanceRef } from './typeGuards';

export const useApplyPointCloudStyling = (
  model?: CognitePointCloudModel<DataSourceType>,
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

function applyStyling(
  model: CognitePointCloudModel<DataSourceType>,
  styling: PointCloudVolumeStylingGroup[]
): void {
  if (styling === undefined) {
    return;
  }

  if (model.styledCollections.length > 0) {
    model.removeAllStyledObjectCollections();
  }
  for (const group of styling) {
    if (group.pointCloudVolumes.length === 0) {
      continue;
    }
    if (isPointCloudVolumesAnnotation(group.pointCloudVolumes)) {
      const collection = new AnnotationIdPointCloudObjectCollection(group.pointCloudVolumes);
      model.assignStyledObjectCollection(collection, group.style);
    } else if (isPointCloudVolumesDMInstanceRef(group.pointCloudVolumes)) {
      const collection = new PointCloudDMVolumeCollection(group.pointCloudVolumes);
      model.assignStyledObjectCollection(collection, group.style);
    }
  }
}
