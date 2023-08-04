import { ValueByDataType } from './containers/Filter';

export interface SearchParams {
  searchQuery?: string;
  filters?: ValueByDataType;
}

export type ResourceItem = {
  id?: number;
  type: ResourceType;
};

export type ResourceType =
  | 'asset'
  | 'timeSeries'
  | 'sequence'
  | 'file'
  | 'event'
  | 'threeD';
