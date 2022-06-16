import { DataModelTypeDefsType } from '../types';

export interface FetchDataDTO {
  dataModelType: DataModelTypeDefsType;
  limit: number;
  cursor: string;
  hasNextPage: boolean;
  dataModelId: string;
  version: string;
}
