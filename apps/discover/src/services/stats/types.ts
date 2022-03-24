import { StatsGetResponse } from '@cognite/discover-api-types';

import { BaseAPIResult } from '../types';

export interface StatsApiResult extends BaseAPIResult {
  data: {
    stats: StatsGetResponse;
  };
}
