export type SearchFilterType = 'STRING' | 'DATE' | 'BOOLEAN' | 'METADATA';
export type SearchFilterSelector = {
  name: string;
  type: SearchFilterType;
  field: string[];
};
export type SearchFilter = SearchFilterSelector & {
  value: string | number;
};

export type InternalFilterSettings = {
  query: string;
  filters: SearchFilter[];
};
