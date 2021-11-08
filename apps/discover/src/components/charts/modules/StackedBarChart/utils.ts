import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { sortObjectsAscending } from '_helpers/sort';
import { LegendCheckboxState } from 'components/charts/common/Legend';
import { getCheckedLegendCheckboxOptions } from 'components/charts/common/Legend/utils';

import { ColorConfig, DataObject } from '../../types';

import { DEFAULT_BAR_COLOR, DEFAULT_NO_DATA_BAR_COLOR } from './constants';

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

export const getFilteredData = <T extends DataObject<T>>(
  data: T[],
  xAccessor: string,
  checkboxOptionAccessor: string,
  checkboxState: LegendCheckboxState
) => {
  const checkedOptions = getCheckedLegendCheckboxOptions(checkboxState);
  const filteredData = data.map((dataElement) => {
    if (checkedOptions.includes(dataElement[checkboxOptionAccessor])) {
      return dataElement;
    }

    return {
      ...dataElement,
      [xAccessor]: 0,
    };
  });
  return filteredData;
};

export const getBarFillColorForDataElement = <T extends DataObject<T>>(
  dataElement: T,
  barColorConfig?: ColorConfig,
  noDataToStack = false
) => {
  if (barColorConfig) {
    const { colors, accessor, defaultColor, noDataColor } = barColorConfig;

    if (noDataToStack) {
      return noDataColor || defaultColor || DEFAULT_NO_DATA_BAR_COLOR;
    }

    const colorKey = dataElement[accessor];
    const color = colors[colorKey];

    return color || defaultColor;
  }

  return DEFAULT_BAR_COLOR;
};

export const getDefaultBarColorConfig = (
  accessor?: string
): ColorConfig | undefined => {
  if (isUndefined(accessor)) return undefined;

  return {
    colors: {},
    accessor,
    defaultColor: DEFAULT_BAR_COLOR,
    noDataColor: DEFAULT_NO_DATA_BAR_COLOR,
  };
};

export const isNoDataAvailable = <T>(data: T[], accessor: string) => {
  if (isEmpty(data)) return true;
  if (data.length > 1) return false;
  return isUndefined(get(data[0], accessor));
};
