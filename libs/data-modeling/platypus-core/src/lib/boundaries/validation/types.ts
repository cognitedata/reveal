import { KeyValueMap } from '../types/key-value-map';

export type ValidatorResult = {
  valid: boolean;
  errors: KeyValueMap;
};
