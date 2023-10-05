import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

const MAX_LENGTH = 255;

export class DataModelDescriptionValidator extends ValidationRule {
  validate(field: string, value: string): ValidatorResult {
    if (value.length > MAX_LENGTH) {
      return {
        valid: false,
        errors: {
          [field]:
            this.validationMessage ||
            field + ' is not valid. It should be 255 characters or less.',
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
