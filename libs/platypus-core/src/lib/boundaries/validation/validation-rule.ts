import { ValidatorResult } from './types';

export abstract class ValidationRule {
  abstract validate(field: string, value: any): ValidatorResult;
}
