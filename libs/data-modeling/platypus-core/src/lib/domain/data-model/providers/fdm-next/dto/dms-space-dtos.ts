import { Filter } from './filters';

export interface SpaceDTO {
  space: string;
  description?: string;
  name?: string;
}

export interface SpaceInstanceDTO extends SpaceDTO {
  createdTime: number;
  lastUpdatedTime: number;
}

export interface ListQueryParams {
  cursor?: string;
  limit?: number;
  includeGlobal?: boolean;
}

export interface SearchParams {
  query: string;
  filter?: Filter;
  limit?: number;
}
