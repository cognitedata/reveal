import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

export class DataModelNameValidator extends ValidationRule {
  validate(field: string, value: string): ValidatorResult {
    const allowedCharactersRegex =
      /(?!^(cdf|dms|pg3|shared|system|node|edge)$)(^[a-zA-Z][a-zA-Z0-9_-]{0,41}[a-zA-Z0-9]?$)/;

    if (!allowedCharactersRegex.test(value)) {
      return {
        valid: false,
        errors: {
          [field]:
            field +
            ' is not valid. It must match the pattern (?!^(cdf|dms|pg3|shared|system|node|edge)$)(^[a-zA-Z][a-zA-Z0-9_-]{0,41}[a-zA-Z0-9]?$)',
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
