import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { isDate } from '../../../../../utils/date';
import { isNumeric } from '../../../../../utils/number';
import { BaseFilterInputType } from '../types';

export const isValidInputValue = (
  inputValue: string | number | Date | undefined,
  type: BaseFilterInputType
) => {
  if (isUndefined(inputValue)) {
    return false;
  }

  switch (type) {
    case 'date':
      return isDate(inputValue);

    case 'number':
      return isNumeric(String(inputValue));

    case 'text':
      return isString(inputValue) && !isEmpty(inputValue);

    default:
      return false;
  }
};
