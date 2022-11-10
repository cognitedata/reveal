import { DataModelTypeDefs, DataModelTypeDefsType } from '../types';

export interface FetchDataDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  relationshipFieldsLimit: number;
  limit: number;
  cursor: string;
  hasNextPage: boolean;
  dataModelId: string;
  version: string;
}

export interface FetchPublishedRowsCountDTO {
  dataModelTypes: DataModelTypeDefsType[];
  dataModelId: string;
  version: string;
}

export interface PublishedRowsCountMap {
  [typeName: string]: number;
}
