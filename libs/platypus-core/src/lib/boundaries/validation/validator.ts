import { KeyValueMap } from '../types/key-value-map';
/* eslint-disable no-prototype-builtins */

import { ValidationRule } from './validation-rule';
import { ValidatorResult } from './types';

interface ValidatorRules {
  [field: string]: ValidationRule[];
}

export class Validator {
  private validators: ValidatorRules = {};

  constructor(private data: KeyValueMap | any) {}

  setData(data: KeyValueMap | any): void {
    this.data = data;
  }

  /**
   * Add Validation rule to this validator
   * @param validator The validation rule
   */
  addRule(field: string, validator: ValidationRule): void {
    if (!this.validators.hasOwnProperty(field)) {
      this.validators[field] = [];
    }

    this.validators[field].push(validator);
  }

  /**
   * Iterates all validation rules in this validator
   * and returns bool if has errors or not.
   * In case even one validation rule fail, the result will be false.
   * @param value Value that has to be validated against validator
   */
  validate(): ValidatorResult {
    const result: ValidatorResult = {
      errors: {},
      valid: true,
    };

    for (const key in this.validators) {
      if (!this.validators[key]) {
        continue;
      }

      this.validators[key].forEach((validator) => {
        if (!this.data.hasOwnProperty(key)) {
          result.errors = Object.assign(result.errors, {
            [key]:
              validator.validationMessage ||
              'Data does not contain ' + key + ' property',
          });
          result.valid = false;
          return;
        }

        const res = validator.validate(key, this.data[key]);

        if (!res.valid) {
          result.errors = Object.assign(result.errors, res.errors);
          result.valid = false;
        }
      });
    }

    return result;
  }

  clearRules(): void {
    this.validators = {};
  }
}
