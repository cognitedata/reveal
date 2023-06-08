import isArray from 'lodash/isArray';

import { FieldValue } from '../../../types';

export interface Props {
  dataType: string;
  field: string;
  fieldValue: FieldValue;
}

export const getChipLabel = ({
  dataType,
  field,
  fieldValue,
}: Props): string => {
  const { operator, value } = fieldValue;

  const prefix = `${dataType} ${field} ${operator.toLowerCase()}`;

  if (isArray(value)) {
    return `${prefix} ${value.join(' and ')}`;
  }

  return `${prefix} ${value}`;
};
