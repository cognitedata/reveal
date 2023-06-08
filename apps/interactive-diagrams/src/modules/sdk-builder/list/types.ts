import { ApiCall } from '@interactive-diagrams-app/modules/types';

export interface ApiListResult extends ApiCall {
  ids?: number[];
}

export interface ListState extends ApiCall {
  [key: string]: any;
}
