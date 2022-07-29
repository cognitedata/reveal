import { DataModelExternalIdValidator } from './data-model-external-id-validator';

describe('DataModelExternalIdValidator', () => {
  const createInstance = () => {
    return new DataModelExternalIdValidator();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('validates string with "_"', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'valid_name');
    expect(result.valid).toBe(true);
  });

  it('validates string with "-"', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'valid-name');
    expect(result.valid).toBe(true);
  });

  it('validates string following camelCase naming convention', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'validName');
    expect(result.valid).toBe(true);
  });

  it('validates string following PascalCase naming convention', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'ValidName');
    expect(result.valid).toBe(true);
  });

  it('does not validate string with "/"', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'valid/Name');
    expect(result.valid).toBe(false);
  });

  it('does not validate string with "$"', () => {
    const validator = createInstance();

    const result = validator.validate('name', 'invalid-name$$.');
    expect(result.valid).toBe(false);
  });
});
