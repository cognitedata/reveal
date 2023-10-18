import { isValidInputValue } from '../isValidInputValue';

describe('isValidInputValue', () => {
  it('should return false for undefined or empty input', () => {
    expect(isValidInputValue(undefined, 'date')).toBe(false);
    expect(isValidInputValue('', 'number')).toBe(false);
  });

  it('should return true for valid date input', () => {
    expect(isValidInputValue(new Date(), 'date')).toBe(true);
  });

  it('should return true for valid number input', () => {
    expect(isValidInputValue(42, 'number')).toBe(true);
  });

  it('should return true for valid text input', () => {
    expect(isValidInputValue('Hello', 'text')).toBe(true);
  });

  it('should return false for invalid date input', () => {
    expect(isValidInputValue('InvalidDate', 'date')).toBe(false);
  });

  it('should return false for invalid number input', () => {
    expect(isValidInputValue('abc123', 'number')).toBe(false);
  });

  it('should return false for invalid text input', () => {
    expect(isValidInputValue(123, 'text')).toBe(false);
  });
});
