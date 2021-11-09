import { ValidationRule } from '@platypus/platypus-core';
import { ValidatorResult } from '../../../boundaries/validation';

export class RequiredFieldValidator extends ValidationRule {
  validate(field: string, value: unknown): ValidatorResult {
    if (!value || (Array.isArray(value) && !value.length)) {
      return {
        valid: false,
        errors: {
          name: field + ' is required field',
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
