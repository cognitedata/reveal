import {
  DataModelTransformation,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
} from '../types';
import { QueryFilter } from './common-dtos';

export interface DataQueryingBaseDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelVersion: DataModelVersion;
  limit: number;
}

export interface ListDataDTO extends DataQueryingBaseDTO {
  cursor: string;
  hasNextPage: boolean;
  filter?: QueryFilter;
}

export interface SearchDataDTO extends DataQueryingBaseDTO {
  searchTerm: string;
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

export interface IngestInstancesDTO {
  dataModelExternalId: string;
  // allow v2
  items: IngestInstanceDTO[];
  space: string;
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  // v2 optional
  model?: string[];
  overwrite?: boolean;
}

export type IngestInstancesResponseDTO = {
  items: {
    [key: string]: string | number | boolean;
  }[];
};

export interface DeleteInstancesDTO {
  dataModelExternalId?: string;
  space: string;
  items: {
    externalId: string;
  }[];
}

export interface FetchDataModelTransformationsDTO {
  dataModelExternalId: string;
  typeName: string;
  version: string;
}

export type CreateDataModelTransformationDTO = Omit<
  DataModelTransformation,
  'id'
>;
