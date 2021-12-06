import { ValidatorResult } from './types';
import { ValidationRule } from './validation-rule';
import { Validator } from './validator';

describe('ValidatorTest', () => {
  class TestValidationRule extends ValidationRule {
    validate(field: string, value: any): ValidatorResult {
      if (!value) {
        return {
          valid: false,
          errors: {
            [field]: this.validationMessage || field + ' is required field',
          },
        } as ValidatorResult;
      }

      return { valid: true, errors: {} };
    }
  }
  const createInstance = () => {
    return new Validator({});
  };

  it('should work', () => {
    const validator = createInstance();
    expect(validator).toBeTruthy();
  });

  it('should validate data against validation rules', () => {
    const validator = createInstance();
    validator.addRule('name', new TestValidationRule());
    validator.addRule('description', new TestValidationRule());
    validator.addRule('username', new TestValidationRule());
    validator.setData({
      name: 'TEst',
      description: null,
      username: '',
    });
    const result = validator.validate();
    expect(result.valid).toBe(false);
    expect(result.errors.name).not.toBeTruthy();
    expect(result.errors.description).toBeTruthy();
    expect(result.errors.username).toBeTruthy();
  });

  it('should validate only props that have assigned validation rules', () => {
    const validator = createInstance();
    validator.addRule('description', new TestValidationRule());
    validator.setData({
      name: '',
      description: null,
    });
    const result = validator.validate();
    expect(result.valid).toBe(false);
    expect(result.errors.name).not.toBeTruthy();
    expect(result.errors.description).toBeTruthy();
  });

  it('should set error if there is validation rule and no data', () => {
    const validator = createInstance();
    validator.addRule('name', new TestValidationRule());
    validator.setData({
      description: 'some description',
    });
    const result = validator.validate();
    expect(result.valid).toBe(false);
    expect(result.errors.name).toEqual('Data does not contain name property');
  });
});
