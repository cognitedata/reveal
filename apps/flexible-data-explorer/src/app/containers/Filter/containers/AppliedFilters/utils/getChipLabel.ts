import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';

import { TFunction } from '../../../../../hooks/useTranslation';
import { FieldValue } from '../../../types';

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

  if (isArray(value)) {
    return `${prefix} ${value.join(
      ` ${t('FILTER_AND_OPERATION', { postProcess: 'lowercase' })} `
    )}`;
  }

  return `${prefix} ${value}`;
};
