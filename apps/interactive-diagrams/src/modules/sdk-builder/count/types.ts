import { ApiCall } from 'modules/types';

export type CountState = {
  [key: string]: ApiCountResult;
};
export interface ApiCountResult extends ApiCall {
  count?: number;
}
