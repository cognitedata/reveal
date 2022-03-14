import {
  CreateSchemaDTO,
  CreateSolutionDTO,
  DeleteSolutionDTO,
  FetchSolutionDTO,
  GraphQLQueryResponse,
  ListVersionsDTO,
  RunQueryDTO,
  UpdateSolutionDataModelFieldDTO,
} from '../dto';
import {
  SolutionSchema,
  Solution,
  SolutionDataModel,
  SolutionDataModelType,
  SolutionDataModelField,
} from '../types';

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

export interface IGraphQlUtilsService {
  /**
   * Parse graphql schema string
   * and converts into SolutonDataModel
   * @param graphQlSchema
   */
  parseSchema(graphQlSchema: string): SolutionDataModel;

  /**
   * Converts SolutonDataModel back into graphql SDL string
   * @param state
   */
  generateSdl(): string;

  /**
   * Adds new type into AST
   * @param name
   */
  addType(name: string): SolutionDataModelType;

  /**
   * Update specified type in AST
   */
  updateType(
    typeName: string,
    updates: Partial<SolutionDataModelType>
  ): SolutionDataModelType;

  /**
   * Removes specified type from AST
   * @param typeName
   */
  removeType(typeName: string): void;

  /**
   * Adds new field for the specified type into AST
   * @param typeName
   * @param fieldName
   * @param fieldProps
   */
  addField(
    typeName: string,
    fieldName: string,
    fieldProps: Partial<UpdateSolutionDataModelFieldDTO>
  ): SolutionDataModelField;

  /**
   * Updates the field for the specified type into AST
   * @param typeName
   * @param fieldName
   * @param updates
   */
  updateTypeField(
    typeName: string,
    fieldName: string,
    updates: Partial<UpdateSolutionDataModelFieldDTO>
  ): SolutionDataModelField;

  /**
   * Removes field from specified type from AST
   * @param typeName
   * @param fieldName
   */
  removeField(typeName: string, fieldName: string): void;
 
  /** Clears the state */
  clear(): void;
}
