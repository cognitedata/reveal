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
  secondValue: string | number
) => {
  if (isNaN(Number(firstValue))) {
    return trim(upperCase(firstValue as string)) >
      trim(upperCase(secondValue as string))
      ? 1
      : -1;
  }
  return Number(firstValue) > Number(secondValue) ? 1 : -1;
};

export const sortObjectsAscending = <T>(list: T[], path: keyof T) =>
  list.slice().sort((first, second) => {
    const firstValue = getValueFromKey(first, path);
    const secondValue = getValueFromKey(second, path);

    return caseInsensitiveSort(firstValue, secondValue);
  });

export const sortObjectsDecending = <T>(list: T[], path: keyof T) =>
  list.slice().sort((first, second) => {
    const firstValue = getValueFromKey(first, path);
    const secondValue = getValueFromKey(second, path);

    return caseInsensitiveSort(secondValue, firstValue);
  });

const getValueFromKey = <T>(object: T, path: keyof T) => {
  const value = get(object, path, '');
  if (isNumber(value)) return Number(value);
  return value;
};
