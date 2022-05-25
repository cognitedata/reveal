import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

export class SolutionDataModelFieldNameValidator extends ValidationRule {
  validate(field: string, value: string | null): ValidatorResult {
    const regex = /^(?![_0-9]+)[a-zA-Z0-9_]+$/g;
    if (!value || !value.match(regex)) {
      return {
        valid: false,
        errors: {
          [field]: this.validationMessage || field + ' must be camelCase',
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
