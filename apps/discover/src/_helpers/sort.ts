import { UseTableRowProps } from 'react-table';

import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import trim from 'lodash/trim';
import upperCase from 'lodash/upperCase';

export const alphanumeric = <T extends Record<string, unknown>>(
  firstRow: UseTableRowProps<T>,
  secondRow: UseTableRowProps<T>,
  columnName: string
) => {
  const rowOneColumn = firstRow.values[columnName];
  const rowTwoColumn = secondRow.values[columnName];
  return caseInsensitiveSort(rowOneColumn, rowTwoColumn);
};

export const caseInsensitiveSort = (
  firstValue: string | number,
  secondValue: string | number,
  reverse = false
) => {
  const format = (input: number | string) => trim(upperCase(input.toString()));
  const order = reverse ? -1 : 1;

  if (isNaN(Number(firstValue))) {
    return format(firstValue) > format(secondValue) ? order : -order;
  }

  return Number(firstValue) > Number(secondValue) ? order : -order;
};

export const sortObjectsAscending = <T>(list: T[], path: string) =>
  list.slice().sort((first, second) => {
    const firstValue = getValueFromKey(first, path);
    const secondValue = getValueFromKey(second, path);

    return caseInsensitiveSort(firstValue, secondValue);
  });

export const sortObjectsDecending = <T>(list: T[], path: string) =>
  list.slice().sort((first, second) => {
    const firstValue = getValueFromKey(first, path);
    const secondValue = getValueFromKey(second, path);

    return caseInsensitiveSort(secondValue, firstValue);
  });

const getValueFromKey = <T>(object: T, path: string) => {
  const value = get(object, path, '');
  if (isNumber(value)) return Number(value);
  return String(value);
};
