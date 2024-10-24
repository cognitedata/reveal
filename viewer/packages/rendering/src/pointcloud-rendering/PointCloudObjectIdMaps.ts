/*!
 * Copyright 2022 Cognite AS
 */

import { DMInstanceRef } from '@reveal/data-providers';

export type PointCloudObjectIdMaps = {
  annotationToObjectIds: Map<number | DMInstanceRef, number>;
  objectToAnnotationIds: Map<number, number | DMInstanceRef>;
};
