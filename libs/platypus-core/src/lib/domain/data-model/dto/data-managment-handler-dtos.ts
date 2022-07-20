import { DataModelTypeDefs, DataModelTypeDefsType } from '../types';

export interface FetchDataDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  limit: number;
  cursor: string;
  hasNextPage: boolean;
  dataModelId: string;
  version: string;
}
