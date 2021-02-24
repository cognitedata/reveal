import { Limit } from '@cognite/sdk';

export type ResourceType =
  | 'assets'
  | 'events'
  | 'files'
  | 'sequences'
  | 'timeseries';

export interface ApiCall {
  fetching: boolean;
  error: boolean;
  done: boolean;
}
export interface ApiResult extends ApiCall {
  ids: number[];
}

export interface Result<T> extends ApiResult {
  items: T[];
  progress: number;
  nextCursor?: string;
}

export interface Query extends Limit {
  filter?: any;
}
