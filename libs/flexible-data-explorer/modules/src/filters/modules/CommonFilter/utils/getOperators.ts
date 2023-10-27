import { Field, Operator } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';

import { DEFAULT_OPERATORS } from '../constants';

export const getOperators = (field: Field): Operator[] => {
  const { operators, type } = field;

  if (operators && !isEmpty(operators)) {
    return operators;
  }

  return DEFAULT_OPERATORS[type];
};
