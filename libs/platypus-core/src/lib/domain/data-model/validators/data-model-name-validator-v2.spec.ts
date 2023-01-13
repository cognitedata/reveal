import { DataModelNameValidatorV2 } from './data-model-name-validator-v2';

describe('DataModelNameValidatorV2', () => {
  const createInstance = () => {
    return new DataModelNameValidatorV2();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('does not validate names longer than 43 characters', () => {
    const validator = createInstance();

    const result = validator.validate(
      'name',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    );
    expect(result.valid).toBe(false);
  });

  it('not validate names starting with a number ', () => {
    const validator = createInstance();

    const result = validator.validate('name', '9-test');
    expect(result.valid).toBe(false);
  });

  it('validates names containing "_"', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'test_name');
    expect(result.valid).toBe(true);
  });

  it('validates names containing "-"', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'test-name');
    expect(result.valid).toBe(true);
  });
});
