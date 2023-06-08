import { ApiCall } from '@interactive-diagrams-app/modules/types';

export type CountState = {
  [key: string]: ApiCountResult;
};
export interface ApiCountResult extends ApiCall {
  count?: number;
}
