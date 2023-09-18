import { isFieldValue } from '../isFieldValue';

describe('isFieldValue', () => {
  it('should return true for a valid FieldValue object', () => {
    const validFieldValue = {
      operator: 'equals',
      value: 42,
    };
    expect(isFieldValue(validFieldValue)).toBe(true);
  });

  it('should return false if operator is not a valid object', () => {
    const invalidFieldValue = {
      operator: {},
      value: 42,
    };
    expect(isFieldValue(invalidFieldValue)).toBe(false);
  });

  it('should return false if operator is missing', () => {
    const missingOperator = {
      value: 42,
    };
    expect(isFieldValue(missingOperator)).toBe(false);
  });

  it('should return false if value is missing', () => {
    const missingValue = {
      operator: 'equals',
    };
    expect(isFieldValue(missingValue)).toBe(false);
  });
});
