/*!
 * Copyright 2024 Cognite AS
 */
import {
  AnnotationIdPointCloudObjectCollection,
  type CognitePointCloudModel,
  type PointCloudAppearance
} from '@cognite/reveal';
import { type StyledPointCloudModelAddOptions } from './calculatePointCloudModelsStyling';

export type AnnotationIdStylingGroup = {
  annotationIds: number[];
  style: PointCloudAppearance;
};

export type PointCloudModelStyling = {
  defaultStyle?: PointCloudAppearance;
  groups?: AnnotationIdStylingGroup[];
};

export function applyPointCloudStyling(
  model: CognitePointCloudModel,
  addOptions: StyledPointCloudModelAddOptions
): void {
  const styling = addOptions.styleGroups;

  model.setDefaultPointCloudAppearance(addOptions.defaultStyle);

  if (styling !== undefined) {
    for (const group of styling) {
      if (group.annotationIds !== undefined) {
        const collection = new AnnotationIdPointCloudObjectCollection(group.annotationIds);

        model.assignStyledObjectCollection(collection, group.style);
      }
    }
  }
}
