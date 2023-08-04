import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';

import { TFunction } from '../../../../../hooks/useTranslation';
import { isDate, formatDate } from '../../../../../utils/date';
import { FieldValue, ValueType } from '../../../types';

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
  const { operator, value } = fieldValue;

  const prefix = `${dataType} ${field} ${t(operator, {
    postProcess: 'lowercase',
  })}`.trim();

  if (isUndefined(value)) {
    return prefix;
  }

  const formattedValue = formatValue(value);

  if (isArray(formattedValue)) {
    return `${prefix} ${formattedValue.join(
      ` ${t('FILTER_AND_OPERATION', { postProcess: 'lowercase' })} `
    )}`;
  }

  return `${prefix} ${formattedValue}`;
};

export const formatValue = (value: ValueType) => {
  if (isArray(value)) {
    return value.map(formatSingleValue);
  }
  return formatSingleValue(value);
};

export const formatSingleValue = (
  value: string | number | Date | boolean | never
) => {
  if (isDate(value)) {
    return formatDate(value);
  }
  return value;
};
