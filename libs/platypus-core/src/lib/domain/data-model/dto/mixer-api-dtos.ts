import { DataModelTypeDefsType } from '../types';

export interface ApiVersionDataModel {
  types: any[];
  graphqlRepresentation: string;
}

export interface DataModelStorageBindingsDTO {
  targetName: string;
  dataModelStorageSource: {
    externalId: string;
    space: string;
  };
}

export interface ApiVersion {
  version: number;
  createdTime: string;
  dataModel: ApiVersionDataModel;
  bindings?: [DataModelStorageBindingsDTO];
}

export interface DataModelApiOutputDTO {
  externalId: string;
  name: string;
  description: string;
  createdTime: number;
  versions?: ApiVersion[];
}

export interface ApiVersionFromGraphQl {
  version?: number;
  apiExternalId: string;
  graphQl: string;
  bindings?: DataModelStorageBindingsDTO[];
  metadata?: {
    [key: string]: unknown;
  };
}

export interface BuildQueryDTO {
  dataModelType: DataModelTypeDefsType;
  limit: number;
  cursor: string;
  hasNextPage: boolean;
}

export interface ApiSpecDTO {
  externalId: string;
  name: string;
  description: string;
  metadata?: {
    [key: string]: unknown;
  };
}
