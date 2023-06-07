import {
  NumericFieldValidator,
  NumericFieldValidatorProps,
} from './numeric-field.validator';

describe('RequiredFieldValidatorTest', () => {
  const createInstance = (options?: NumericFieldValidatorProps) => {
    return new NumericFieldValidator(options);
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('should validate if no data is passed', async () => {
    const validator = createInstance({
      options: {
        max: 30,
        min: 18,
      },
    });
    let result = validator.validate('age', 10);
    expect(result.valid).toBe(false);
    expect(result.errors.age).toBeTruthy();

    result = validator.validate('age', 31);
    expect(result.valid).toBe(false);

    result = validator.validate('age', 20);
    expect(result.valid).toBe(true);
  });
});
