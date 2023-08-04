import isEmpty from 'lodash/isEmpty';

import { Field, Operator } from '../../../types';
import { DEFAULT_OPERATORS } from '../constants';

export const getOperators = (field: Field): Operator[] => {
  const { operators, type } = field;

  if (operators && !isEmpty(operators)) {
    return operators;
  }

  return DEFAULT_OPERATORS[type];
};
