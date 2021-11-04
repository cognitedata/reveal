import { ValidatorResult } from './types';

export abstract class ValidationRule {
  abstract validate(value: any): ValidatorResult;
}
