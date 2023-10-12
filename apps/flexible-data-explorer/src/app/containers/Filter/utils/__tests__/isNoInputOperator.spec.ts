import difference from 'lodash/difference';

import { Operator } from '../../types';
import { isNoInputOperator } from '../isNoInputOperator';

const NO_INPUT_OPERATORS = [
  Operator.IS_SET,
  Operator.IS_NOT_SET,
  Operator.IS_TRUE,
  Operator.IS_FALSE,
];

const OTHER_OPERATORS = difference(Object.values(Operator), NO_INPUT_OPERATORS);

describe('isNoInputOperator', () => {
  it('should return true for no input operators', () => {
    NO_INPUT_OPERATORS.forEach((operator) => {
      expect(isNoInputOperator(operator)).toBe(true);
    });
  });

  it('should return false for other operators', () => {
    OTHER_OPERATORS.forEach((operator) => {
      expect(isNoInputOperator(operator)).toBe(false);
    });
  });
});
