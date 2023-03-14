import { PlotDatum } from 'plotly.js';

import isArray from 'lodash/isArray';
import get from 'lodash/get';

import { CustomDataType } from '../types';

export const getPointCustomData = (
  point: PlotDatum
): CustomDataType | undefined => {
  const customData = get(point.data, 'customData');

  if (!customData) {
    return undefined;
  }

  if (!isArray(customData)) {
    return customData;
  }

  return customData[point.pointIndex];
};
