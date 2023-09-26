import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
} from '../types';

import { QueryFilter, QuerySort } from './common-dtos';

export interface DataQueryingBaseDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelVersion: DataModelVersion;
  filter?: QueryFilter;
  limit: number;
}

export interface ListDataDTO extends DataQueryingBaseDTO {
  cursor: string;
  filter?: QueryFilter;
  sort?: QuerySort;
  nestedLimit: number;
}

export interface SearchDataDTO extends DataQueryingBaseDTO {
  filter?: QueryFilter;
  searchTerm: string;
}

export interface GetByExternalIdDTO {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelSpace: string;
  externalId: string;
  instanceSpace: string;
  nestedLimit: number;
  nestedCursors?: { [key in string]: string };
  nestedFilters?: { [key in string]: QueryFilter };
  /**
   * What fields to include for query (if specified only these fields will be queried)
   */
  limitFields?: string[];
  version: string;
}

export interface FetchFilteredRowsCountDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelId: string;
  version: string;
  space: string;
  filter: QueryFilter | { [key in string]: QueryFilter } | null;
}

export interface FetchPublishedRowsCountDTO {
  dataModelTypes: DataModelTypeDefsType[];
  dataModelId: string;
  version: string;
  space: string;
}

export interface PublishedRowsCountMap {
  [typeName: string]: number;
}

export interface IngestInstanceDTO {
  // The value can also be a { externalId } or null for direction relatiobships.
  [key: string]:
    | string
    | number
    | boolean
    | object
    | { externalId: string }
    | null;
}

export interface IngestEdgeDTO extends IngestInstanceDTO {
  externalId: string;
  startNode: string;
  endNode: string;
}

export type IngestInstancesDTO = {
  dataModelExternalId: string;
  // allow v2
  space: string;
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  // allow v3
  version: string;
  property?: string;
  // v2 optional
  model?: string[];
  overwrite?: boolean;
} & (
  | { type: 'node'; items: IngestInstanceDTO[] }
  | { type: 'edge'; items: IngestEdgeDTO[] }
);

export type IngestInstancesResponseDTO = {
  items: {
    [key: string]:
      | string
      | number
      | boolean
      | object
      | { externalId: string }
      | null;
  }[];
};

export interface DeleteInstancesDTO {
  dataModelExternalId?: string;
  space: string;
  type: 'node' | 'edge';
  items: {
    externalId: string;
  }[];
}

export interface FetchDataModelTransformationsDTO {
  spaceExternalId: string;
  instanceSpaceExternalId: string;
  typeName: string;
  viewVersion: string;
}

export type CreateDataModelTransformationDTO = {
  name: string;
  externalId: string;
  destination:
    | {
        type: 'data_model_instances';
        modelExternalId: string;
        spaceExternalId: string;
        instanceSpaceExternalId: string;
      }
    | {
        type: 'nodes';
        view: {
          space: string;
          externalId: string;
          version: string;
        };
        instanceSpace: string;
      }
    | {
        type: 'edges';
        edgeType: {
          space: string;
          externalId: string;
        };
        instanceSpace: string;
      };
};
