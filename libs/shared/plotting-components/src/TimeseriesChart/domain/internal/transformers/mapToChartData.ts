import isUndefined from 'lodash/isUndefined';

import { Data, ValueType } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../service/types';
import { TimeseriesChartMetadata } from '../types';
import { getDatapointValue } from '../utils';

interface Props {
  datapoints: TimeseriesDatapoint[];
  metadata: TimeseriesChartMetadata;
}

export const mapToChartData = ({ datapoints, metadata }: Props): Data => {
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
    interpolation: metadata.isStep ? 'step' : undefined,
  };
};
