import { DatapointAggregate } from '@cognite/sdk';

import isUndefined from 'lodash/isUndefined';

import { ValueType } from '../../../../LineChart';

export const adaptDatapointAggregatesToChartData = (
  data: DatapointAggregate[]
) => {
  return data.reduce(
    (result, datapoint) => {
      const { timestamp, average } = datapoint;

      if (isUndefined(average)) {
        return result;
      }

      return {
        x: [...result.x, timestamp],
        y: [...result.y, average],
        customData: [...result.customData, datapoint],
      };
    },
    {
      x: [] as ValueType[],
      y: [] as ValueType[],
      customData: [] as DatapointAggregate[],
    }
  );
};
