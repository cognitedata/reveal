import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

const MAX_LENGTH = 255;

/*
This validation rule is for DMS V3.

For DMS and Mixer API V2, we have DataModelNameValidatorV2.
*/
export class DataModelNameValidator extends ValidationRule {
  validate(field: string, value: string): ValidatorResult {
    if (value.length > MAX_LENGTH) {
      return {
        valid: false,
        errors: {
          [field]:
            field + ' is not valid. It should be 255 characters or less.',
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
