import { RequiredFieldValidator } from './required-field.validator';

describe('RequiredFieldValidatorTest', () => {
  const createInstance = () => {
    return new RequiredFieldValidator();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('should validate if no data is passed', async () => {
    const validator = createInstance();
    let result = validator.validate('name', '');
    expect(result.valid).toBe(false);

    result = validator.validate('name', ' ');
    expect(result.valid).toBe(false);

    result = validator.validate('name', null);
    expect(result.valid).toBe(false);

    result = validator.validate('name', []);
    expect(result.valid).toBe(false);
  });
});
