import { Filter } from './filters';

export interface ViewReference {
  type: 'view';
  space: string;
  externalId: string;
  version: string;
}

export interface ViewCreateDefinition {
  space: string;
  externalId: string;
  name?: string;
  description?: string;
  filter?: Filter;
  implements?: Array<ViewReference>;
  version: string;
  //properties:
}
