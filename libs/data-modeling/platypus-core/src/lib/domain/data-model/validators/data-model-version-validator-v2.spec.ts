import { DataModelVersionValidatorV2 } from './data-model-version-validator-v2';

describe('Data model version validator v2', () => {
  const createInstance = () => {
    return new DataModelVersionValidatorV2();
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

  it('does not validate version containing "_"', () => {
    const validator = createInstance();

    const result = validator.validate('version', 'test_version');
    expect(result.valid).toBe(false);
  });

  it('does not validate version containing "-"', () => {
    const validator = createInstance();

    const result = validator.validate('version', 'test-version');
    expect(result.valid).toBe(false);
  });
});
