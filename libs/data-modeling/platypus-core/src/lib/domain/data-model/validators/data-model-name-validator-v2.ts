import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

/*
This validation rule is for V2 of the Mixer API:
https://cognitedata.slack.com/archives/C03G11UNHBJ/p1670584948148959?thread_ts=1670501607.079329&cid=C03G11UNHBJ

For DMS and Mixer API V3, we have DataModelNameValidator
*/
export class DataModelNameValidatorV2 extends ValidationRule {
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
