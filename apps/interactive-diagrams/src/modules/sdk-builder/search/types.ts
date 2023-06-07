import { ApiCall, Status } from 'modules/types';

export interface ApiSearchResult extends ApiCall {
  ids: any[];
  status: Status;
}

export interface Filter {
  filter?: any;
  search?: any;
}
export interface SearchState {
  [key: string]: { ids: number[]; status: Status };
}
