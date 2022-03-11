import { RefObject } from 'react';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import { LegendCheckboxState } from './common/Legend';
import { getCheckedLegendCheckboxOptions } from './common/Legend/utils';
import { DEFAULT_COLOR, DEFAULT_NO_DATA_COLOR } from './constants';
import { ColorConfig, DataObject, ScaleRange } from './types';

export const filterUndefinedValues = <T>(data: T[], accessor: string) => {
  return data.filter((dataElement) => !isUndefined(get(dataElement, accessor)));
};

export const getStylePropertyValue = (
  ref: RefObject<HTMLElement>,
  property: string
) => {
  if (ref.current) {
    const chartStyles = window.getComputedStyle(ref.current);
    const propertyValue = chartStyles.getPropertyValue(property);
    return propertyValue;
  }
  return '0';
};

export const getValuesOfObjectsByKey = <T>(data: T[], key: string) => {
  return data.map((dataElement) => get(dataElement, key));
};

export const getSumOfValues = <T>(values: T[keyof T][]) => {
  const sum = values.reduce((value1, value2) => {
    return Number(value1) + Number(value2);
  }, 0);
  return Number(sum.toFixed(2));
};

export const getSumOfValuesOfObjectsByKey = <T>(
  data: T[],
  xAccessor: string
) => {
  const barValues = getValuesOfObjectsByKey<T>(data, xAccessor);
  const sumOfBarValues = getSumOfValues<T>(barValues);
  return sumOfBarValues;
};

export const getFilteredData = <T extends DataObject<T>>(
  data: T[],
  checkboxOptionAccessor: string,
  checkboxState: LegendCheckboxState
) => {
  const checkedOptions = getCheckedLegendCheckboxOptions(checkboxState);
  const filteredData = data.filter((dataElement) =>
    checkedOptions.includes(get(dataElement, checkboxOptionAccessor))
  );
  return filteredData;
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

export const getRangeScaleFactor = (scaleFactor?: number): ScaleRange => {
  if (!scaleFactor) return [1, 1];

  const scaleFactorMin = Number((1 - scaleFactor).toFixed(2));
  const scaleFactorMax = Number((1 + scaleFactor).toFixed(2));

  return [scaleFactorMin, scaleFactorMax];
};
