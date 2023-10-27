import { isFieldValue } from '../isFieldValue';

describe('isFieldValue', () => {
  it('should return true for a valid FieldValue object', () => {
    const validFieldValue = {
      operator: 'equals',
    };
    expect(isFieldValue(validFieldValue)).toBe(true);
  });

  it('should return false if operator is not a valid object', () => {
    const invalidFieldValue = {
      operator: {},
    };
    expect(isFieldValue(invalidFieldValue)).toBe(false);
  });

  it('should return false if operator is missing', () => {
    const missingOperator = {};
    expect(isFieldValue(missingOperator)).toBe(false);
  });
});
