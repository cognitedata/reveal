import isEmpty from 'lodash/isEmpty';

import { LineChartProps } from '../types';

import { getDataAsArray } from './getDataAsArray';

export const checkIsEmptyData = (data: LineChartProps['data']) => {
  return getDataAsArray(data).every(({ x }) => isEmpty(x));
};
