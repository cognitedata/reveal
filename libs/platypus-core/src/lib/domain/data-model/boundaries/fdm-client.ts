import {
  ConflictMode,
  CreateDataModelDTO,
  CreateDataModelTransformationDTO,
  CreateDataModelVersionDTO,
  DeleteDataModelDTO,
  DeleteInstancesDTO,
  FetchDataDTO,
  FetchDataModelDTO,
  FetchDataModelTransformationsDTO,
  FetchDataModelVersionDTO,
  FetchPublishedRowsCountDTO,
  GraphQLQueryResponse,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
  ListDataModelVersionsDTO,
  PublishDataModelVersionDTO,
  PublishedRowsCountMap,
  RunQueryDTO,
  UpdateDataModelDTO,
} from '../dto';

import {
  DataModel,
  DataModelTransformation,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
} from '../types';

export interface FlexibleDataModelingClient {
  /**
   * Lists the available Data Models
   * @returns
   */
  listDataModels(): Promise<DataModel[]>;

  /**
   * List Data Model Versions
   * @param dto
   */
  listDataModelVersions(
    dto: ListDataModelVersionsDTO
  ): Promise<DataModelVersion[]>;

  /**
   * Fetch the specified DataModel
   * @param dto FetchDataModelDTO
   * @returns
   */
  fetchDataModel(dto: FetchDataModelDTO): Promise<DataModel>;

  /**
   * Fetch data model version details, GraphQL Schema...etc.
   * @param dto
   */
  fetchDataModelVersion(
    dto: FetchDataModelVersionDTO
  ): Promise<DataModelVersion>;

  /**
   * Creates new Data Model
   * @param dto CreateDataModelDTO
   */
  createDataModel(dto: CreateDataModelDTO): Promise<DataModel>;

  /**
   * Updates Data Model metadata (name, description...etc.)
   * @param dto CreateDataModelDTO
   */
  updateDataModel(dto: UpdateDataModelDTO): Promise<DataModel>;

  /**
   * Publishes new or updates the current data model version
   * depending on the specified conflictMode.
   *
   * @param dto - PublishDataModelVersionDTO
   * @param conflictMode - NEW_VERSION | PATCH
   */
  publishDataModelVersion(
    dto: PublishDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<DataModelVersion>;

  /**
   * Deletes the specified Data Model including all versions
   * And the data related with it.
   */
  deleteDataModel(dto: DeleteDataModelDTO): Promise<unknown>;

  /**
   * Validates Data Model GraphQL.
   * Checks for sytax errors, unsupported features, breaking changes
   * @param dto
   * @param validateBreakingChanges
   */
  validateDataModel(
    dto: PublishDataModelVersionDTO,
    validateBreakingChanges?: boolean
  ): Promise<DataModelValidationError[]>;

  /**
   * Run GraphQL query against a Data Model Version
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse>;

  /**
   * Returns the data as Paginated Response for a type.
   * @param dto
   */
  fetchData(dto: FetchDataDTO): Promise<PaginatedResponse>;

  /**
   * Ingest data model type instances (data).
   * @param dto
   */
  ingestInstances(dto: IngestInstancesDTO): Promise<IngestInstancesResponseDTO>;

  /**
   * Deletes Data Model Type Instances (data)
   * @param dto
   */
  deleteInstances(dto: DeleteInstancesDTO): Promise<boolean | void>;

  /**
   * Returns the transformations created for the specified data model type.
   * @param dto
   */
  getTransformations(
    dto: FetchDataModelTransformationsDTO
  ): Promise<DataModelTransformation[]>;

  createTransformation(
    dto: CreateDataModelTransformationDTO
  ): Promise<DataModelTransformation>;

  /**
   * Fetches the number of published rows by type
   * @param dto
   */
  fetchPublishedRowsCount(
    dto: FetchPublishedRowsCountDTO
  ): Promise<PublishedRowsCountMap>;
}
