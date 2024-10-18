/*!
 * Copyright 2022 Cognite AS
 */

export type PointCloudObjectIdMaps = {
  annotationToObjectIds: Map<number | string, number>;
  objectToAnnotationIds: Map<number, number | string>;
};
