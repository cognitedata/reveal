import { transformValue } from '../transformValue';

describe('transformValue', () => {
  it('should handle empty input', () => {
    const inputValue = '';
    const result = transformValue(inputValue);
    expect(result).toBe(inputValue);
  });

  it('should transform text input', () => {
    const inputValue = 'Hello';
    const result = transformValue<string>(inputValue, 'text');
    expect(result).toBe('Hello');
  });

  it('should transform number input', () => {
    const inputValue = '42';
    const result = transformValue<number>(inputValue, 'number');
    expect(result).toBe(42);
  });

  it('should transform date input', () => {
    const inputValue = '2023-09-15';
    const result = transformValue<Date>(inputValue, 'date');
    expect(result).toEqual(new Date('2023-09-15'));
  });

  it('should handle invalid text inputs', () => {
    const invalidInputs = [undefined, 42, new Date()];
    invalidInputs.forEach((inputValue) => {
      const result = transformValue<string>(
        inputValue as unknown as string,
        'text'
      );
      expect(result).toBeUndefined();
    });
  });

  it('should handle invalid number inputs', () => {
    const invalidInputs = [undefined, 'Hello', new Date()];
    invalidInputs.forEach((inputValue) => {
      const result = transformValue<string>(
        inputValue as unknown as string,
        'number'
      );
      expect(result).toBeUndefined();
    });
  });

  it('should handle invalid date inputs', () => {
    const invalidInputs = [undefined, 'Hello'];
    invalidInputs.forEach((inputValue) => {
      const result = transformValue<string>(
        inputValue as unknown as string,
        'date'
      );
      expect(result).toBeUndefined();
    });
  });
});
