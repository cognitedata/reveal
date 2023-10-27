import { BaseFilterInputType } from '../types';

import { isValidInputValue } from './isValidInputValue';

export const transformValue = <T>(
  inputValue: string,
  type: BaseFilterInputType = 'text'
) => {
  if (!isValidInputValue(inputValue, type)) {
    return undefined;
  }

  if (type === 'text') {
    return String(inputValue) as T;
  }

  if (type === 'number') {
    return Number(inputValue) as T;
  }

  if (type === 'date') {
    return new Date(inputValue) as T;
  }
};
