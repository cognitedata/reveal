import { Limit } from '@cognite/sdk';
import { ItemsState, CountState, SearchState, ListState } from './types';

export * from './count/types';
export * from './search/types';
export * from './list/types';
export * from './items/types';

export interface ResourceState<T> {
  count: CountState;
  search: SearchState;
  list: ListState;
  items: ItemsState<T>;
}

export type ResourceType = 'assets' | 'files';
export type Status = 'pending' | 'error' | 'success' | undefined;

export interface ApiCall {
  status?: Status;
}
export interface ApiResult extends ApiCall {
  ids: number[];
}
export interface Result<T> extends ApiResult {
  items: T[];
  nextCursor?: string;
  fetching?: boolean;
  done?: number;
  error?: number;
  progress: number;
}
export interface Query extends Limit {
  filter?: any;
}

export interface Item {
  id: number;
  assetId?: number;
}
