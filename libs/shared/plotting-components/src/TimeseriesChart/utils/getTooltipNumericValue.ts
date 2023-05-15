import isUndefined from 'lodash/isUndefined';

import { addUnit } from './addUnit';

export const getTooltipNumericValue = (value?: number, unit?: string) => {
  if (isUndefined(value)) {
    return undefined;
  }

  return addUnit(value.toFixed(3), unit);
};
