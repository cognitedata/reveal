import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';

import { TFunction } from '../../../../../hooks/useTranslation';
import { FieldValue } from '../../../types';

import { formatValue } from './formatValue';

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

  if (isUndefined(value)) {
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
