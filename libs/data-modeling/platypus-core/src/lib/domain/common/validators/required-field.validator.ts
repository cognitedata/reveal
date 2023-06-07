import { DataUtils } from '../../../boundaries/utils';
import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

export class RequiredFieldValidator extends ValidationRule {
  validate(field: string, value: unknown): ValidatorResult {
    if (
      value !== false &&
      value !== 0 &&
      (!value ||
        (Array.isArray(value) && !value.length) ||
        (DataUtils.isString(value) && !(value as string).trim()))
    ) {
      return {
        valid: false,
        errors: {
          [field]: this.validationMessage || field + ' is required field',
        },
      } as ValidatorResult;
    }

    if (Array.isArray(value) && !value.filter((option) => option).length) {
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
