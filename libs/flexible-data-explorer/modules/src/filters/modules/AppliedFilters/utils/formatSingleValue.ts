import { FieldType, ValueType } from '@fdx/shared/types/filters';
import { formatDate } from '@fdx/shared/utils/date';

export const formatSingleValue = (value: ValueType, type: FieldType) => {
  if (type === 'date') {
    return formatDate(value as Date);
  }
  return value;
};
