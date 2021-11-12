import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
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
  let noDataToStack = true;

  const stackedData = orderedData.map((dataElement) => {
    const width = Number(get(dataElement, xAccessor));
    stackedWidth += width;

    const stackedDataObject = {
      ...dataElement,
      stackedWidth: parseFloat(stackedWidth.toFixed(2)),
    };

    if (width) noDataToStack = false;

    return stackedDataObject;
  });

  return {
    // Return only one element if no data to stack.
    // This prevents rendering overlapped multiple bars.
    stackedData: noDataToStack ? [stackedData[0]] : stackedData,
    noDataToStack,
  };
};

export const getBarFillColorForDataElement = <T extends DataObject<T>>(
  dataElement: T,
  colorConfig?: ColorConfig,
  noDataToStack = false
) => {
  if (colorConfig) {
    const { colors, accessor, defaultColor, noDataColor } = colorConfig;

    if (noDataToStack) {
      return noDataColor || defaultColor || DEFAULT_NO_DATA_COLOR;
    }

    const colorKey = dataElement[accessor];
    const color = colors[colorKey];

    return color || defaultColor;
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

export const isNoDataAvailable = <T>(data: T[], accessor: string) => {
  if (isEmpty(data)) return true;
  if (data.length > 1) return false;
  return isUndefined(get(data[0], accessor));
};
