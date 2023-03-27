import { StringDatapoint } from '@cognite/sdk';

import { ValueType } from '../../../../LineChart';

export const adaptStringDatapointsToChartData = (data: StringDatapoint[]) => {
  return data.reduce(
    (result, datapoint) => {
      const { timestamp, value } = datapoint;

      return {
        x: [...result.x, timestamp],
        y: [...result.y, value],
        customData: [...result.customData, datapoint],
      };
    },
    {
      x: [] as ValueType[],
      y: [] as ValueType[],
      customData: [] as StringDatapoint[],
    }
  );
};
