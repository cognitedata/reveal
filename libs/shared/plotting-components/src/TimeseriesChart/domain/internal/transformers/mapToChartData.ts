import isUndefined from 'lodash/isUndefined';

import { Data, ValueType } from '../../../../LineChart';

import { TimeseriesDatapoint } from '../../service/types';
import { getDatapointValue } from '../utils';

export const mapToChartData = (datapoints: TimeseriesDatapoint[]): Data => {
  let x: ValueType[] = [];
  let y: ValueType[] = [];
  let customData: TimeseriesDatapoint[] = [];

  for (let i = 0; i < datapoints.length; i++) {
    const datapoint = datapoints[i];
    const { timestamp } = datapoint;
    const datapointValue = getDatapointValue(datapoint);

    if (isUndefined(datapointValue)) {
      continue;
    }

    x.push(timestamp);
    y.push(datapointValue);
    customData.push(datapoint);
  }

  return {
    x,
    y,
    customData,
  };
};
