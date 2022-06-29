import { TrajectoryDataRequest } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

export interface TrajectoriesDataRequest {
  sequenceExternalIds: Set<TrajectoryDataRequest['sequenceExternalId']>;
  unit?: UserPreferredUnit;
}
