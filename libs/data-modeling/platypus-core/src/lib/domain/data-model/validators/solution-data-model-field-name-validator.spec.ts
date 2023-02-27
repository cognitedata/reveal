import { SolutionDataModelFieldNameValidator } from './solution-data-model-field-name-validator';

describe('SolutionDataModelFieldNameValidatorTest', () => {
  const createInstance = () => {
    return new SolutionDataModelFieldNameValidator();
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('should validate if name is camelCase', async () => {
    const validator = createInstance();
    let result = validator.validate('name', 'camelCase');
    expect(result.valid).toBe(true);

    result = validator.validate('name', 'camel_case');
    expect(result.valid).toBe(true);

    result = validator.validate('name', 'camel_case1');
    expect(result.valid).toBe(true);

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
