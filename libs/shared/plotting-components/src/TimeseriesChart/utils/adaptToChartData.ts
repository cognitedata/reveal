import { DatapointAggregate } from '@cognite/sdk';
import isUndefined from 'lodash/isUndefined';

import { Data } from '../../LineChart';

export const adaptToChartData = (data: DatapointAggregate[]): Data => {
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
      x: [] as Date[],
      y: [] as number[],
      customData: [] as DatapointAggregate[],
    }
  );
};
