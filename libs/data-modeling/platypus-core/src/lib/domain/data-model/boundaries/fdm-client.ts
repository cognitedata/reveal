import { GraphQLInputObjectType } from 'graphql';

import {
  ConflictMode,
  CreateDataModelDTO,
  CreateDataModelTransformationDTO,
  DeleteDataModelDTO,
  DeleteInstancesDTO,
  ListDataDTO,
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
  SearchDataDTO,
  UpdateDataModelDTO,
  GetByExternalIdDTO,
  DeleteDataModelOutput,
  FetchFilteredRowsCountDTO,
} from '../dto';
import { ListSpacesDTO } from '../providers/fdm-next/dto/dms-space-dtos';
import {
  BuiltInType,
  CdfResourceInstance,
  DataModel,
  DataModelTransformation,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
  SpaceDTO,
  SpaceInstance,
} from '../types';

export interface FlexibleDataModelingClient {
  version: string;
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
  deleteDataModel(
    dto: DeleteDataModelDTO,
    deleteViews: boolean
  ): Promise<DeleteDataModelOutput>;

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
   * Validates Graphql string
   * Checks for sytax errors, unsupported features
   * @param graphql
   * @param builtInTypes
   */
  validateGraphql(
    graphql: string,
    builtInTypes: BuiltInType[]
  ): DataModelValidationError[];

  /**
   * Run GraphQL query against a Data Model Version
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse>;

  /**
   * Returns the data as Paginated Response for a type.
   * @param dto
   */
  fetchData(dto: ListDataDTO): Promise<PaginatedResponse>;

  /**
   * Returns the search results from a given query.
   * @param dto
   */
  searchData(dto: SearchDataDTO): Promise<CdfResourceInstance[]>;

  /**
   * Returns a result based on an externalId for a type
   * @param dto
   */
  getDataByExternalId(dto: GetByExternalIdDTO): Promise<CdfResourceInstance>;

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
   * Fetch all spaces.
   */
  getSpaces(dto?: ListSpacesDTO): Promise<SpaceInstance[]>;

  /**
   * Creates a new space for data models.
   * @param dto
   */
  createSpace(dto: SpaceDTO): Promise<SpaceInstance>;

  /**
   * Fetches the number of filtered rows by type
   * @param dto
   */
  fetchFilteredRowsCount(dto: FetchFilteredRowsCountDTO): Promise<number>;

  /**
   * Fetches the number of published rows by type
   * @param dto
   */
  fetchPublishedRowsCount(
    dto: FetchPublishedRowsCountDTO
  ): Promise<PublishedRowsCountMap>;

  /**
   * Get the GraphQL endpoint for a given data model
   * @param dto
   */
  getQueryEndpointUrl(dto: {
    space: string;
    externalId: string;
    version: string;
  }): string;

  getFilterForType(dto: {
    space: string;
    externalId: string;
    version: string;
    typeName: string;
  }): Promise<GraphQLInputObjectType | undefined>;
}
