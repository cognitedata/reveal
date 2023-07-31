import type { OptionType } from '@cognite/cogs.js-v9';
import type {
  DatapointAggregate,
  DatapointAggregates,
  Timeseries,
} from '@cognite/sdk';

export interface TimeseriesData
  extends Pick<DatapointAggregates, 'externalId' | 'unit'> {
  datapoints?: DatapointAggregate[];
  timeseries: Partial<Timeseries>;
}

export interface TimeseriesOption extends OptionType<string> {
  data?: TimeseriesData;
}
