/*!
 * Copyright 2022 Cognite AS
 */

import { DMInstanceKey, DMInstanceRef } from '@reveal/utilities';

export type PointCloudObjectIdMaps = {
  annotationToObjectIds: Map<number | DMInstanceKey, number>;
  objectToAnnotationIds: Map<number, number | DMInstanceRef>;
};
