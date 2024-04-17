/*!
 * Copyright 2024 Cognite AS
 */
import { type IdEither } from '@cognite/sdk/dist/src';

export const queryKeys = {
  all: ['cdf'] as const,
  // TIMESERIES
  timeseries: () => [...queryKeys.all, 'timeseries'] as const,
  timeseriesById: (ids: IdEither[]) => [...queryKeys.timeseries(), ids] as const
} as const;
