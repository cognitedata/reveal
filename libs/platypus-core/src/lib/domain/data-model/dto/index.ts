import {
  DataModelTypeDefsField,
  DataModelTypeDefsFieldType,
  DataModelTypeDefsType,
  DataModelVersionStatus,
} from '../types';

export * from './data-model-storage-api-dtos';

export interface CreateDataModelDTO {
  name: string;
  description?: string;
  owner?: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}

export interface DeleteDataModelDTO {
  id: string;
}

export interface FetchDataModelDTO {
  dataModelId: string;
}
export interface FetchVersionDTO {
  /** dataModelId (template group external id) */
  dataModelId: string;
  version: string;
}

export interface ListVersionsDTO {
  /** dataModelId (template group external id) */
  dataModelId: string;
  version?: string;
}

export interface CreateDataModelVersionDTO {
  /** Data Model externalId */
  externalId: string;
  /** GraphQL schema as string */
  schema: string;
  version?: string;
  // eslint-disable-next-line
  bindings?: any;
  /**
   * When resource was created
   */
  createdTime?: number;
  /**
   * When resource was last updated
   */
  lastUpdatedTime?: number;
  status?: DataModelVersionStatus;
}

export interface GraphQlQueryParams {
  query: string;
  operationName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any;
}
export interface RunQueryDTO {
  graphQlParams: GraphQlQueryParams;
  /** dataModelId (template group external id) */
  dataModelId: string;
  schemaVersion: string;
  extras?: {
    [key: string]: unknown;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphQLQueryResponse = { data?: any; errors?: Array<any> };

export type ConflictMode = 'NEW_VERSION' | 'PATCH';

export interface ApiSpecDTO {
  externalId: string;
  name: string;
  description: string;
  metadata?: {
    [key: string]: unknown;
  };
}

export interface DataModelApiBinding {
  targetName: string;
  tableDataSource: {
    externalId: string;
  };
}

export interface ApiVersionDataModel {
  types: any[];
  graphqlRepresentation: string;
}

export interface ApiVersion {
  version: number;
  createdTime: string;
  dataModel: ApiVersionDataModel;
  bindings?: [DataModelStorageBindingsDTO];
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
export interface DataModelApiOutputDTO {
  externalId: string;
  name: string;
  description: string;
  createdTime: number;
  versions?: ApiVersion[];
}

export interface UpdateDataModelFieldDTO
  extends Omit<DataModelTypeDefsField, 'type'> {
  type: DataModelTypeDefsFieldType | string;
}

export interface DataModelStorageBindingsDTO {
  targetName: string;
  dataModelStorageSource: {
    externalId: string;
    space: string;
  };
}

export interface BuildQueryDTO {
  dataModelType: DataModelTypeDefsType;
  limit: number;
  cursor: string;
  hasNextPage: boolean;
}

export interface FetchDataDTO {
  dataModelType: DataModelTypeDefsType;
  limit: number;
  cursor: string;
  hasNextPage: boolean;
  dataModelId: string;
  version: string;
}

export interface DataModelSpaceDTO {
  externalId: string;
}
