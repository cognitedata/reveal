import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

export class DataModelVersionValidatorV2 extends ValidationRule {
  validate(field: string, value: string): ValidatorResult {
    const allowedCharactersRegex = /^[1-9][0-9]{0,41}[0-9]?$/;

    if (!allowedCharactersRegex.test(value)) {
      return {
        valid: false,
        errors: {
          [field]:
            field +
            ' is not valid. It must match the pattern ^[1-9][0-9]{0,41}[0-9]?$',
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
