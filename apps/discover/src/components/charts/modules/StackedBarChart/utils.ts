import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { sortObjectsAscending } from '_helpers/sort';

import { ColorConfig, DataObject } from '../../types';

import { DEFAULT_COLOR, DEFAULT_NO_DATA_COLOR } from './constants';

export const sumObjectsByKey = <T>(
  data: T[],
  groupByAccessor: string,
  valueAccessor: string,
  toFixed?: number
) => {
  const groupedData = groupBy(data, groupByAccessor);

  const summedData = Object.keys(groupedData).map((key) => {
    const currentGroupData = groupedData[key];
    const sum = currentGroupData.reduce((accumulator, dataElement) => {
      const originalValue = get(dataElement, valueAccessor);
      const reducerValue = isString(originalValue)
        ? parseFloat(originalValue)
        : Number(originalValue);
      return accumulator + reducerValue;
    }, 0);

    return {
      ...currentGroupData[0],
      [valueAccessor]: toFixed ? parseFloat(sum.toFixed(1)) : sum,
    };
  });

  return summedData;
};

export const fixValuesToDecimalPlaces = <T>(
  data: T[],
  valueAccessor: string,
  toFixed?: number
) =>
  data.map((dataElement) => {
    const originalValue = get(dataElement, valueAccessor);
    const fixedValue = isString(originalValue)
      ? parseFloat(originalValue)
      : Number(originalValue);

    return {
      ...dataElement,
      [valueAccessor]: parseFloat(fixedValue.toFixed(toFixed)),
    };
  });

export const getStackedData = <T>(data: T[], xAccessor: string) => {
  const orderedData = sortObjectsAscending<T>(data, xAccessor);

  let stackedWidth = 0;

  return orderedData.map((dataElement) => {
    const width = Number(get(dataElement, xAccessor));
    stackedWidth += width;

    return {
      ...dataElement,
      stackedWidth: parseFloat(stackedWidth.toFixed(2)),
    };
  });
};

export const getBarFillColorForDataElement = <T extends DataObject<T>>(
  dataElement: T,
  colorConfig?: ColorConfig
) => {
  if (colorConfig) {
    const { colors, accessor, defaultColor } = colorConfig;
    const colorKey = get(dataElement, accessor);
    const color = get(colors, colorKey, defaultColor);

    return color;
  }

  return DEFAULT_COLOR;
};

export const getBarFillColorForDisabledBar = (colorConfig?: ColorConfig) => {
  if (colorConfig) {
    const { defaultColor, noDataColor } = colorConfig;
    return noDataColor || defaultColor || DEFAULT_NO_DATA_COLOR;
  }
  return DEFAULT_COLOR;
};

export const getDefaultColorConfig = (
  accessor?: string
): ColorConfig | undefined => {
  if (isUndefined(accessor)) return undefined;

  return {
    colors: {},
    accessor,
    defaultColor: DEFAULT_COLOR,
    noDataColor: DEFAULT_NO_DATA_COLOR,
  };
};
