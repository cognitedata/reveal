import { DataUtils } from '../../../boundaries/utils';
import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

export class RequiredFieldValidator extends ValidationRule {
  validate(field: string, value: unknown): ValidatorResult {
    if (
      !value ||
      (Array.isArray(value) && !value.length) ||
      (DataUtils.isString(value) && !(value as string).trim())
    ) {
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
