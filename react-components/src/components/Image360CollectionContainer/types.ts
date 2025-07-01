import { type DMInstanceRef, type PointCloudAppearance } from '@cognite/reveal';

export type Image360PolygonStylingGroup = {
  image360Polygons: Array<number | DMInstanceRef>;
  style: PointCloudAppearance;
};
