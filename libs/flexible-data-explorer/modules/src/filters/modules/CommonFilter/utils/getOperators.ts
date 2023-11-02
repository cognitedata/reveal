import { Field, Operator } from '@fdx/shared/types/filters';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import { DEFAULT_OPERATORS, EXISTANCE_OPERATORS } from '../../../constants';

export const getOperators = (field: Field): Operator[] => {
  const { operators, type, exist } = field;

  if (operators && !isEmpty(operators)) {
    return operators;
  }

  const defaultOperators = DEFAULT_OPERATORS[type];

  if (exist) {
    return difference(defaultOperators, EXISTANCE_OPERATORS);
  }

  return defaultOperators;
};
