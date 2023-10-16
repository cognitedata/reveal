import { GraphQLInputObjectType } from 'graphql';

import {
  ConflictMode,
  CreateDataModelTransformationDTO,
  DeleteInstancesDTO,
  FetchDataModelTransformationsDTO,
  FetchFilteredRowsCountDTO,
  FetchPublishedRowsCountDTO,
  GetByExternalIdDTO,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
  ListDataDTO,
  PublishDataModelVersionDTO,
  PublishedRowsCountMap,
  SearchDataDTO,
} from '../dto';
import {
  BuiltInType,
  CdfResourceInstance,
  DataModelTransformation,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
} from '../types';

export interface FlexibleDataModelingClient {
  version: string;

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
