import { TimeseriesMetadataAggregateResponse } from '@fdx/services/instances/timeseries/types';
import { Field } from '@fdx/shared/types/filters';

import { Timeseries } from '@cognite/sdk';

export const mapToMetadataFields = (
  data: TimeseriesMetadataAggregateResponse[]
): Field<Timeseries>[] => {
  return data.map(({ value }) => {
    return {
      id: `metadata.${value}`,
      displayName: value,
      type: 'string',
    };
  });
};
