/*!
 * Copyright 2024 Cognite AS
 */

import { TableExpressionContainsAnyFilterV3 } from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_SOURCE, CORE_DM_3D_CONTAINER_SPACE } from '../../utilities/constants';
import { DMInstanceRef } from '../types';

export function getRevisionContainsAnyFilter(revisionReferences: DMInstanceRef[]): TableExpressionContainsAnyFilterV3 {
  return {
    containsAny: {
      property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId, 'revisions'],
      values: revisionReferences
    }
  } as const satisfies TableExpressionContainsAnyFilterV3;
}
