/*!
 * Copyright 2026 Cognite AS
 */

import type { HasExistingDataFilterV3 } from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_CONTAINER_SOURCE } from '../../utilities/constants';

export { isCoreDmObject3DFilter, isCoreDmVisualizableFilter } from '../../image-360-data-providers/cdm/queryFilters';

export const isCoreDmPointCloudVolumeFilter = {
  hasData: [COGNITE_POINT_CLOUD_VOLUME_CONTAINER_SOURCE]
} as const satisfies HasExistingDataFilterV3;
