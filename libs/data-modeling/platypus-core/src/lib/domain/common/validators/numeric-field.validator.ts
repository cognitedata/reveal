import { DataUtils } from '../../../boundaries/utils';
import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';
import { ValidationRuleProps } from '../../../boundaries/validation/validation-rule';

export interface NumericFieldValidatorOptions {
  min?: number;
  max?: number;
}

export interface NumericFieldValidatorProps extends ValidationRuleProps {
  options: NumericFieldValidatorOptions;
}

export class NumericFieldValidator extends ValidationRule {
  constructor(props?: NumericFieldValidatorProps) {
    super(props);
  }
  validate(field: string, value: unknown): ValidatorResult {
    if (!DataUtils.isNumber(value)) {
      return {
        valid: false,
        errors: {
          [field]: field + ' is not a number',
        },
      } as ValidatorResult;
    }

    if (this.options.min && (value as number) < this.options.min) {
      return {
        valid: false,
        errors: {
          [field]: `${field} should not be less than ${this.options.min}`,
        },
      } as ValidatorResult;
    }

    if (this.options.max && (value as number) > this.options.max) {
      return {
        valid: false,
        errors: {
          [field]: `${field} should not be bigger than ${this.options.max}`,
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
