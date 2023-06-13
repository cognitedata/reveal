import { ValueByDataType } from './containers/search/Filter';

export interface SearchParams {
  searchQuery?: string;
  filters?: ValueByDataType;
}
