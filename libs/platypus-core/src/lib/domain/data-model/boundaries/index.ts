import {
  BuildQueryDTO,
  ConflictMode,
  CreateDataModelVersionDTO,
  CreateSolutionDTO,
  DeleteSolutionDTO,
  FetchSolutionDTO,
  GraphQLQueryResponse,
  ListVersionsDTO,
  RunQueryDTO,
  UpdateSolutionDataModelFieldDTO,
} from '../dto';
import {
  DataModel,
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  DataModelVersion,
} from '../types';

export interface IDataModelsApiService {
  create(dto: CreateSolutionDTO): Promise<DataModel>;
  delete(dto: DeleteSolutionDTO): Promise<unknown>;
  list(): Promise<DataModel[]>;
  fetch(dto: FetchSolutionDTO): Promise<DataModel>;
}

export interface IDataModelVersionApiService {
  /**
   * Fetch solution (template group)
   * @param dto
   */
  fetchVersion(dto: FetchSolutionDTO): Promise<DataModelVersion>;
  /**
   * List Solution schema (template groups) versions
   * @param dto
   */
  listVersions(dto: ListVersionsDTO): Promise<DataModelVersion[]>;

  /**
   * Publish new schema by bumping the version.
   * @param dto - {solutionId, version, schema, bindings}
   * @param conflictMode - NEW_VERSION | PATCH
   */
  publishVersion(
    dto: CreateDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<DataModelVersion>;

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
  parseSchema(graphQlSchema: string): DataModelTypeDefs;

  /**
   * Converts SolutonDataModel back into graphql SDL string
   * @param state
   */
  generateSdl(): string;

  /**
   * Adds new type into AST
   * @param name
   */
  addType(name: string, directive?: string): DataModelTypeDefsType;

  /**
   * Update specified type in AST
   */
  updateType(
    typeName: string,
    updates: Partial<DataModelTypeDefsType>
  ): DataModelTypeDefsType;

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
  ): DataModelTypeDefsField;

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
  ): DataModelTypeDefsField;

  /**
   * Removes field from specified type from AST
   * @param typeName
   * @param fieldName
   */
  removeField(typeName: string, fieldName: string): void;

  /** Clears the state */
  clear(): void;
}

export interface IQueryBuilderService {
  getOperationName(typeName: string): string;
  buildQuery(dto: BuildQueryDTO): string;
}
