import { ColumnSchema, Items } from '@transformations/types';

export type QueryResultsResponse = {
  schema: Items<ColumnSchema>;
  results: Items<{ [K: string]: string }>;
};

export type QueryResults = {
  schema: ColumnSchema[];
  results: { [K: string]: string }[];
  isQueryEmpty?: boolean;
};
