import isUndefined from 'lodash/isUndefined';

import { ValueType } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../service/types';

export const getDatapointValue = (
  datapoint: TimeseriesDatapoint
): ValueType | undefined => {
  const { value, average } = datapoint;

  if (!isUndefined(value)) {
    return value;
  }

  if (!isUndefined(average)) {
    return average;
  }

  return undefined;
};
