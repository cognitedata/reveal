import { RefObject } from 'react';

import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import isUndefined from 'lodash/isUndefined';
import without from 'lodash/without';

import { LegendCheckboxState } from './common/Legend';
import { getCheckedLegendCheckboxOptions } from './common/Legend/utils';
import {
  AXIS_LABEL_FONT_SIZE,
  DEFAULT_COLOR,
  DEFAULT_NO_DATA_COLOR,
} from './constants';
import { ChartAxis, ColorConfig, DataObject, ScaleRange } from './types';

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

export const getValidatedValues = <T>(values: T[]) => {
  return without(values, undefined, null);
};

export const getCalculatedMarginLeft = <T>(data: T[], yAxis: ChartAxis) => {
  const { accessor, formatAxisLabel } = yAxis;

  const yValues = data.map((dataElement) => get(dataElement, accessor));
  const formattedYValues = formatAxisLabel
    ? yValues.map(formatAxisLabel)
    : yValues;

  /**
   * When taking the lengths, the following logic must be checked.
   * Otherwise, if the length of a yValue such as 1.00095 will be taken as 7.
   * This leads to miscalculate the margin left.
   */
  const yAxisLabelLengths = formattedYValues.map((value) => {
    // If the value is not a number, take the length directly.
    if (isNaN(Number(value))) {
      return value.length;
    }

    // If the value is a number, round it and then take the length.
    return String(Math.round(value)).length;
  });

  const yAxisLabelsMaxLength = Math.max(...yAxisLabelLengths);
  const yAxisLabelsSpace = yAxisLabelsMaxLength * AXIS_LABEL_FONT_SIZE;

  return yAxisLabelsSpace;
};
