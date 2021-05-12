import { ApiCall } from 'modules/types';

export interface ApiListResult extends ApiCall {
  ids?: number[];
}

export interface ListState extends ApiCall {
  [key: string]: any;
}
