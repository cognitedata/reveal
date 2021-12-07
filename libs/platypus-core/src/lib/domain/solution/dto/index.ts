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
