import { ViewCreateDefinition, ViewReference } from './dms-view-dtos';
import { Filter } from './filters';

export interface DataModelDTO {
  space: string;
  externalId: string;
  name?: string;
  description?: string;
  version: string;
  views?: Array<ViewCreateDefinition | ViewReference>;
}

export interface DataModelInstanceDTO extends DataModelDTO {
  createdTime: number;
  lastUpdatedTime: number;
}

export interface DataModelReference {
  space: string;
  externalId: string;
}

export interface DataModelSort {
  property:
    | 'space'
    | 'externalId'
    | 'name'
    | 'description'
    | 'version '
    | 'createdTime'
    | 'lastUpdatedTime';

  direction?: 'ascending' | 'descending';
  nullsFirst?: boolean;
}

export interface ListQueryParams {
  space?: string;
  cursor?: string;
  limit?: number;
  inlineViews?: boolean;
}

export interface FilterParams {
  cursor?: string;
  limit?: number;
  spaces?: Array<string>;
  filter: Filter;
  sort?: Array<DataModelSort>;
}
