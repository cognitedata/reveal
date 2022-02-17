import {
  CreateSchemaDTO,
  CreateSolutionDTO,
  DeleteSolutionDTO,
  FetchSolutionDTO,
  GraphQLQueryResponse,
  ListVersionsDTO,
  RunQueryDTO,
} from '../dto';
import { SolutionSchema, Solution } from '../types';

export interface ISolutionsApiService {
  createSolution(dto: CreateSolutionDTO): Promise<Solution>;
  deleteSolution(dto: DeleteSolutionDTO): Promise<unknown>;
  listSolutions(): Promise<Solution[]>;
  fetchSolution(dto: FetchSolutionDTO): Promise<Solution>;
}

export interface ISolutionSchemaApiService {
  /**
   * Fetch solution (template group)
   * @param dto
   */
  fetchSchemaVersion(dto: FetchSolutionDTO): Promise<SolutionSchema>;
  /**
   * List Solution schema (template groups) versions
   * @param dto
   */
  listSchemaVersions(dto: ListVersionsDTO): Promise<SolutionSchema[]>;

  /**
   * Publish new schema by bumping the version.
   * @param dto
   */
  publishSchema(dto: CreateSchemaDTO): Promise<SolutionSchema>;

  /**
   * Patch the existing version, but will fail if there are breaking changes.
   * @param dto
   */
  updateSchema(dto: CreateSchemaDTO): Promise<SolutionSchema>;

  /**
   * Run GraphQL Query.
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse>;
}
