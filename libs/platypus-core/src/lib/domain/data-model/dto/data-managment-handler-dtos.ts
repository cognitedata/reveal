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
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelVersion: DataModelVersion;
  externalId: string;
  nestedLimit: number;
  nestedCursors?: { [key in string]: string };
  nestedFilters?: { [key in string]: QueryFilter };
  /**
   * What fields to include for query (if specified only these fields will be queried)
   */
  limitFields?: string[];
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
  [key: string]: string | number | boolean | { externalId: string } | null;
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
  // v2 optional
  model?: string[];
  overwrite?: boolean;
} & (
  | { type: 'node'; items: IngestInstanceDTO[] }
  | { type: 'edge'; items: IngestEdgeDTO[] }
);

export type IngestInstancesResponseDTO = {
  items: {
    [key: string]: string | number | boolean;
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
  version: string;
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
        type: 'instances';
        viewSpaceExternalId: string;
        viewExternalId: string;
        viewVersion: string;
        instanceSpaceExternalId: string;
      };
};
