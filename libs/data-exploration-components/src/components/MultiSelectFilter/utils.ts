import { OptionType } from '@cognite/cogs.js';

import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

export const isNilOption = <ValueType>({ value }: OptionType<ValueType>) => {
  if (!isUndefined(value) && isString(value)) {
    return true;
  }
  return false;
};
