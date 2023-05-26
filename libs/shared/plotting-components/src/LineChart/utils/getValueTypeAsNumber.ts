import dayjs from 'dayjs';
import isDate from 'lodash/isDate';
import isNumber from 'lodash/isNumber';

import { ValueType } from '../types';

const PLOTLY_DATE_FORMAT = 'YYYY-MM-DD mm:hh';

export const getValueTypeAsNumber = (
  value: ValueType,
  defaultValue: string | number
): number => {
  if (isNumber(value)) {
    return value;
  }

  if (isDate(value)) {
    return value.getTime();
  }

  if (dayjs(value, PLOTLY_DATE_FORMAT).isValid()) {
    return new Date(String(value)).getTime();
  }

  return Number(defaultValue);
};
