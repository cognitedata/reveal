import { DatapointAggregate } from '@cognite/sdk';
import isUndefined from 'lodash/isUndefined';

import { Data } from '../../LineChart';

export const adaptToChartData = (data: DatapointAggregate[]): Data => {
  const coordinates = data.reduce(
    (result, { timestamp, average }) => {
      if (isUndefined(average)) {
        return result;
      }

      return {
        x: [...result.x, timestamp],
        y: [...result.y, average],
      };
    },
    {
      x: [] as Date[],
      y: [] as number[],
    }
  );

  return {
    ...coordinates,
  };
};
