import { Filter } from './filters';

export type ViewReference = {
  space: string;
  externalId: string;
  version: string;
};

export interface ViewCreateDefinition {
  space: string;
  externalId: string;
  name?: string;
  description?: string;
  filter?: Filter;
  implements?: Array<ViewReference & { type: 'view' }>;
  version: string;
  //properties:
}

export type ViewInstance = ViewCreateDefinition;

export type ListQueryParams = {
  limit?: number;
  cursor?: string;
  space?: string;
};
