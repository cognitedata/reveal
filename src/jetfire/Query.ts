import { RowSchema } from './Schema';

export type QueryResults = {
  schema: RowSchema;
  results: { [K: string]: string }[];
  isQueryEmpty?: boolean;
};

export class Query {
  // eslint-disable-next-line no-empty-function
  constructor(readonly query: string) {}
}
