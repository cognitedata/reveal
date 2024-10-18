/*!
 * Copyright 2024 Cognite AS
 */

import { TableExpressionContainsAnyFilterV3, TableExpressionEqualsFilterV3 } from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_SOURCE, CORE_DM_3D_CONTAINER_SPACE } from '../../utilities/constants';
import { DMInstanceRef } from '../types';

export function getModelEqualsFilter<T extends DMInstanceRef>(model3DReference: T): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId, 'model3D'],
      value: model3DReference
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}

export function getRevisionContainsAnyFilter<T extends DMInstanceRef>(
  revisionReferences: T[]
): TableExpressionContainsAnyFilterV3 {
  return {
    containsAny: {
      property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId, 'revisions'],
      values: revisionReferences
    }
  } as const satisfies TableExpressionContainsAnyFilterV3;
}
