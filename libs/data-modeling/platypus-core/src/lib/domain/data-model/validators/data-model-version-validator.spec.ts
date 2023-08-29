import { DataModelVersionValidator } from './data-model-version-validator';

describe('Data model version validator', () => {
  const createInstance = () => {
    return new DataModelVersionValidator();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('does not validate version longer than 43 characters', () => {
    const validator = createInstance();

    const result = validator.validate(
      'version',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    );
    expect(result.valid).toBe(false);
  });

  it('does not validate versions with "@"', () => {
    const validator = createInstance();

    const result = validator.validate('version', 'version@');
    expect(result.valid).toBe(false);
  });

  it('validates version containing "_"', () => {
    const validator = createInstance();

    const result = validator.validate('version', 'test_version');
    expect(result.valid).toBe(true);
  });

  it('validates version containing "-"', () => {
    const validator = createInstance();

    const result = validator.validate('version', 'test-version');
    expect(result.valid).toBe(true);
  });

  it('validates version containing "."', () => {
    const validator = createInstance();

    const result = validator.validate('version', 'v2.1-alpha0');
    expect(result.valid).toBe(true);
  });
});
