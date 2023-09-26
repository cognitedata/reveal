import isArray from 'lodash/isArray';

import { TFunction } from '../../../../../hooks/useTranslation';
import { formatDate } from '../../../../../utils/date';
import { FieldType, FieldValue, ValueType } from '../../../types';

export interface Props {
  dataType?: string;
  field: string;
  fieldValue: FieldValue;
  t: TFunction;
}

export const getChipLabel = ({
  dataType = '',
  field,
  fieldValue,
  t,
}: Props): string => {
  const { operator, value, type } = fieldValue;

  const prefix = `${dataType} ${field} ${t(operator, {
    postProcess: 'lowercase',
  })}`.trim();

  if (type === 'boolean') {
    return prefix;
  }

  const formattedValue = formatValue(value, type);

  if (isArray(formattedValue)) {
    return `${prefix} ${formattedValue.join(
      ` ${t('FILTER_AND_OPERATION', { postProcess: 'lowercase' })} `
    )}`;
  }

  return `${prefix} ${formattedValue}`;
};

export const formatValue = (value: ValueType, type: FieldType) => {
  if (isArray(value)) {
    return value.map((item) => formatSingleValue(item, type));
  }
  return formatSingleValue(value, type);
};

export const formatSingleValue = (value: ValueType, type: FieldType) => {
  if (type === 'date') {
    return formatDate(value as Date);
  }
  return value;
};
