export interface CreateSolutionDTO {
  name: string;
  description?: string;
  owner?: string;
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
}

export interface GraphQlQueryParams {
  query: string;
  operationName: string;
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

export interface SolutionApiTableDTO {
  externalId: string;
  name: string;
  columns: {
    [name: string]: string;
  };
}
export interface SolutionApiDTO {
  externalId: string;
  name?: string;
  apiSpecReference?: {
    externalId: string;
    version: number;
  };
  bindings: SolutionApiBinding[];
}

export interface SolutionApiSpecVersion {
  version: number;
  createdTime: number;
  graphqlRepresentation: string;
}
export interface SolutionApiOutputDTO {
  externalId: string;
  name: string;
  description: string;
  createdTime: number;
  versions?: SolutionApiSpecVersion[];
}

export interface IngestDataRowDTO {
  externalId: string;
  values: {
    [name: string]: string;
  };
}
export interface IngestTableDataDTO {
  externalId: string;
  data: IngestDataRowDTO[];
}
