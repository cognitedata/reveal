import compact from 'lodash/compact';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { ColorConfig, DataObject } from '../../types';

import { DEFAULT_PLOT_COLOR } from './constants';

export const getPlotColorForDataElement = <T extends DataObject<T>>(
  dataElement: T,
  colorConfig?: ColorConfig,
  noData = false
) => {
  if (colorConfig) {
    const { colors, accessor, defaultColor } = colorConfig;

    if (noData) {
      return undefined;
    }

    const colorKey = get(dataElement, accessor);
    const color = colors[colorKey];

    return color || defaultColor;
  }

  return DEFAULT_PLOT_COLOR;
};

export const getCalculatedYAxisTicks = <T>(data: T[], accessor: string) => {
  const values = uniq(
    compact(data.map((dataElement) => get(dataElement, accessor)))
  );
  return values.length;
};
