import { RefObject } from 'react';

import groupBy from 'lodash/groupBy';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import pickBy from 'lodash/pickBy';

import { caseInsensitiveSort, sortObjectsAscending } from '_helpers/sort';

import { DEFAULT_BAR_COLOR, DEFAULT_NO_DATA_BAR_COLOR } from './constants';
import { ColorConfig, DataObject, LegendCheckboxState } from './types';

export const getStylePropertyValue = (
  ref: RefObject<HTMLElement>,
  property: string
) => {
  if (ref.current) {
    const chartStyles = window.getComputedStyle(ref.current);
    const propertyValue = chartStyles.getPropertyValue(property);
    return propertyValue;
  }
  return '';
};

export const sumObjectsByKey = <T>(
  data: T[],
  groupByAccessor: keyof T,
  valueAccessor: keyof T,
  toFixed?: number
) => {
  const groupedData = groupBy(data, groupByAccessor);

  const summedData = Object.keys(groupedData).map((key) => {
    const currentGroupData = groupedData[key];
    const sum = currentGroupData.reduce((accumulator, dataElement) => {
      const originalValue = dataElement[valueAccessor];
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
  valueAccessor: keyof T,
  toFixed?: number
) =>
  data.map((dataElement) => {
    const originalValue = dataElement[valueAccessor];
    const fixedValue = isString(originalValue)
      ? parseFloat(originalValue)
      : Number(originalValue);

    return {
      ...dataElement,
      [valueAccessor]: parseFloat(fixedValue.toFixed(toFixed)),
    };
  });

export const getValuesOfObjectsByKey = <T>(data: T[], key: keyof T) =>
  data.map((dataElement) => dataElement[key]);

export const getStackedData = <T>(data: T[], xAccessor: keyof T) => {
  const orderedData = sortObjectsAscending<T>(data, xAccessor);

  let stackedWidth = 0;
  let noDataToStack = true;

  const stackedData = orderedData.map((dataElement) => {
    const width = Number(dataElement[xAccessor]);
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

export const getSumOfValues = <T>(values: T[keyof T][]) => {
  const sum = values.reduce((value1, value2) => {
    return Number(value1) + Number(value2);
  }, 0);

  return parseFloat(sum.toFixed(2));
};

export const getSumOfValuesOfObjectsByKey = <T>(
  data: T[],
  xAccessor: keyof T
) => {
  const barValues = getValuesOfObjectsByKey<T>(data, xAccessor);
  const sumOfBarValues = getSumOfValues<T>(barValues);
  return sumOfBarValues;
};

export const getLegendInitialCheckboxState = <T extends DataObject<T>>(
  data: T[],
  accessor: string
) => {
  const checkboxOptions = [
    ...new Set(data.map((dataElement) => dataElement[accessor])),
  ]
    .sort(caseInsensitiveSort)
    .filter((option) => !isUndefined(option));

  const checkboxState: LegendCheckboxState = {};

  checkboxOptions.forEach((option) => {
    checkboxState[option] = true;
  });

  return checkboxState;
};

export const getCheckedLegendCheckboxOptions = (
  checkboxState: LegendCheckboxState
) => Object.keys(pickBy(checkboxState));

export const getFilteredData = <T extends DataObject<T>>(
  data: T[],
  xAccessor: keyof T,
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
    const { colors, accessor, defaultColor, noDataBarColor } = barColorConfig;

    if (noDataToStack) {
      return noDataBarColor || defaultColor || DEFAULT_NO_DATA_BAR_COLOR;
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
    noDataBarColor: DEFAULT_NO_DATA_BAR_COLOR,
  };
};

export const isNoDataAvailable = <T>(data: T[], accessor: keyof T) => {
  if (!data.length) return true;
  if (data.length > 1) return false;
  return isUndefined(data[0][accessor]);
};
