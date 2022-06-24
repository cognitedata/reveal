import { DataModelTypeNameValidator } from './data-model-type-name-validator';

describe('DataModelTypeNameValidatorTest', () => {
  const createInstance = () => {
    return new DataModelTypeNameValidator();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('should validate if name is PascalCase', async () => {
    const validator = createInstance();
    let result = validator.validate('name', 'PascalCase');
    expect(result.valid).toBe(true);

    result = validator.validate('name', 'pascalCase');
    expect(result.valid).toBe(false);

    result = validator.validate('name', 'pascal_Case');
    expect(result.valid).toBe(false);

    result = validator.validate('name', 'Pascal_case');
    expect(result.valid).toBe(true);

    result = validator.validate('name', 'Pascal_case1');
    expect(result.valid).toBe(true);

    result = validator.validate('name', '1PascalCase');
    expect(result.valid).toBe(false);

    result = validator.validate('name', '');
    expect(result.valid).toBe(false);

    result = validator.validate('description', '_Test');
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeTruthy();

    result = validator.validate('name', null);
    expect(result.valid).toBe(false);

    result = validator.validate('name', '1Test');
    expect(result.valid).toBe(false);
  });
});
