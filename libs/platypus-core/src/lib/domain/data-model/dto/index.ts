import {
  DataModelTypeDefsField,
  DataModelTypeDefsFieldType,
  DataModelTypeDefsType,
} from '../types';

export interface CreateSolutionDTO {
  name: string;
  description?: string;
  owner?: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}

export interface DeleteSolutionDTO {
  id: string;
}

export interface FetchSolutionDTO {
  solutionId: string;
}
export interface FetchVersionDTO {
  /** SolutionId (template group external id) */
  solutionId: string;
  version: string;
}

export interface ListVersionsDTO {
  /** SolutionId (template group external id) */
  solutionId: string;
  version?: string;
}

export interface CreateSchemaDTO {
  /** SolutionId (template group external id) */
  solutionId: string;
  /** GraphQL schema as string */
  schema: string;
  version?: string;
  // eslint-disable-next-line
  bindings?: any;
}

export interface GraphQlQueryParams {
  query: string;
  operationName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any;
}
export interface RunQueryDTO {
  graphQlParams: GraphQlQueryParams;
  /** SolutionId (template group external id) */
  solutionId: string;
  schemaVersion: string;
  extras?: {
    [key: string]: unknown;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphQLQueryResponse = { data?: any; errors?: Array<any> };

export interface ApiSpecDTO {
  externalId: string;
  name: string;
  description: string;
  metadata?: {
    [key: string]: unknown;
  };
}

export interface SolutionApiBinding {
  targetName: string;
  tableDataSource: {
    externalId: string;
  };
}

export interface ApiVersionDataModel {
  types: any[];
  graphqlRepresentation: string;
}

export interface ApiVersionBindings {
  targetName: string;
  dataSource: {
    externalId: string;
  };
}
export interface ApiVersion {
  version: number;
  createdTime: string;
  dataModel: ApiVersionDataModel;
  bindings?: [ApiVersionBindings];
}

export interface ApiVersionFromGraphQl {
  version?: number;
  apiExternalId: string;
  graphQl: string;
  bindings?: ApiVersionBindings[];
  metadata?: {
    [key: string]: unknown;
  };
}
export interface SolutionApiOutputDTO {
  externalId: string;
  name: string;
  description: string;
  createdTime: number;
  versions?: ApiVersion[];
}

export interface UpdateSolutionDataModelFieldDTO
  extends Omit<DataModelTypeDefsField, 'type'> {
  type: DataModelTypeDefsFieldType | string;
}

export interface SolutionStorageDataModelDTO {
  externalId: string;
  properties: {
    [propertyName: string]: {
      type: string;
      nullable: boolean;
    };
  };
  extends?: string[];
  indexes?: {
    indexName: string;
    fields: string[];
  }[];
}

/*
https://pr-ark-codegen-1662.specs.preview.cogniteapp.com/v1.json.html#operation/listInstances
*/
export interface ListInstancesReqDTO {
  modelExternalId: string;
  filter?: any;
  sort?: string[];
  limit?: number;
  cursor?: string;
}

export interface StorageInstanceDTO {
  modelExternalId: string;
  properties: {
    [propertyName: string]: string | number | boolean;
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
  solutionId: string;
  version: string;
}
