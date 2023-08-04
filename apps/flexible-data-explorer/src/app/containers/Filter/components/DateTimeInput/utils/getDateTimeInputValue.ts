import { formatDate, isDate } from '../../../../../utils/date';
import { ValueType } from '../../../types';

export const getDateTimeInputValue = (value: ValueType) => {
  if (isDate(value)) {
    return formatDate(value, 'YYYY-MM-DDTHH:mm');
  }
  return undefined;
};
