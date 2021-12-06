import { KeyValueMap } from '../types';
import { ValidatorResult } from './types';

export interface ValidationRuleProps {
  validationMessage?: string;
  options?: KeyValueMap;
}
export abstract class ValidationRule {
  validationMessage: string;
  options: KeyValueMap;

  constructor(props?: ValidationRuleProps) {
    this.validationMessage = props?.validationMessage || '';
    this.options = props?.options || {};
  }
  abstract validate(field: string, value: any): ValidatorResult;
}
