/*!
 * Copyright 2024 Cognite AS
 */

import type { TableExpressionContainsAnyFilterV3 } from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_SOURCE, CORE_DM_3D_CONTAINER_SPACE } from '../../utilities/constants';
import type { DMInstanceRef } from '@reveal/utilities';

export function getRevisionContainsAnyFilter(revisionReferences: DMInstanceRef[]): TableExpressionContainsAnyFilterV3 {
  return {
    containsAny: {
      property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId, 'revisions'],
      values: revisionReferences
    }
  } as const satisfies TableExpressionContainsAnyFilterV3;
}
