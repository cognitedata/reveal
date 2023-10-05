import { formatDate } from '../../../../../utils/date';
import { FieldType, ValueType } from '../../../types';

export const formatSingleValue = (value: ValueType, type: FieldType) => {
  if (type === 'date') {
    return formatDate(value as Date);
  }
  return value;
};
