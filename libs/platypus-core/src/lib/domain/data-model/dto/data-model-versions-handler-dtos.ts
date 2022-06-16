import { DataModelVersionStatus } from '../types';

export interface FetchDataModelVersionDTO {
  dataModelId: string;
  version: string;
}

export interface ListDataModelVersionsDTO {
  /** dataModelId (data model external id) */
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
