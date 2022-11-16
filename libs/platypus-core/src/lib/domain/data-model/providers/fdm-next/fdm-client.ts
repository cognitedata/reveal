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
  PublishedRowsCountMap,
  RunQueryDTO,
  UpdateDataModelDTO,
} from '../../dto';

import {
  DataModel,
  DataModelTransformation,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
} from '../../types';

import { FlexibleDataModelingClient } from '../../boundaries/fdm-client';
import { SpacesApiService } from './services/data-modeling-api';
import { SpaceDTO } from './dto/dms-space-dtos';
import { DataModelDTO } from './dto/dms-data-model-dtos';
import { DataModelDataMapper } from './data-mappers';
import { DataUtils } from '../../../../boundaries/utils/data-utils';
import { FdmMixerApiService } from './services/mixer-api';

export class FdmClient implements FlexibleDataModelingClient {
  private spacesApi: SpacesApiService;
  private mixerApiService: FdmMixerApiService;
  private dataModelDataMapper: DataModelDataMapper;

  constructor(
    spacesApi: SpacesApiService,
    mixerApiService: FdmMixerApiService
  ) {
    this.spacesApi = spacesApi;
    this.mixerApiService = mixerApiService;
    this.dataModelDataMapper = new DataModelDataMapper();
  }

  /**
   * Lists the available Data Models
   * @returns
   */
  listDataModels(): Promise<DataModel[]> {
    // by default if no externalId or space is provided
    // mixerApi will return the latest version of all data models (unique data models)
    return this.mixerApiService.listDataModelVersions().then((dataModels) => {
      return dataModels.map((item) =>
        this.dataModelDataMapper.deserialize(item)
      );
    });
  }

  /**
   * List Data Model Versions
   * @param dto
   */
  listDataModelVersions(
    dto: ListDataModelVersionsDTO
  ): Promise<DataModelVersion[]> {
    throw 'Not implemented';
  }

  /**
   * Fetch the specified DataModel
   * @param dto FetchDataModelDTO
   * @returns
   */
  fetchDataModel(dto: FetchDataModelDTO): Promise<DataModel> {
    return this.mixerApiService
      .listDataModelVersions(dto.space!, {
        externalId: { eq: dto.dataModelId },
      })
      .then((dataModels) => {
        return this.dataModelDataMapper.deserialize(dataModels[0]);
      });
  }

  /**
   * Fetch data model version details, GraphQL Schema...etc.
   * @param dto
   */
  fetchDataModelVersion(
    dto: FetchDataModelVersionDTO
  ): Promise<DataModelVersion> {
    throw 'Not implemented';
  }

  /**
   * Creates new Data Model
   * @param dto CreateDataModelDTO
   */
  createDataModel(dto: CreateDataModelDTO): Promise<DataModel> {
    const space: SpaceDTO = {
      space: dto.externalId || DataUtils.convertToCamelCase(dto.name),
      name: dto.name,
    };

    return new Promise((resolve, reject) => {
      this.spacesApi.upsert([space]).then((response) => {
        const spaceInstance = Array.isArray(response.items)
          ? response.items[0]
          : response.items;

        const dataModelDto: DataModelDTO = {
          space: spaceInstance.space,
          externalId: dto.externalId || DataUtils.convertToCamelCase(dto.name),
          name: dto.name,
          description: dto.description,
          version: '1',
        };

        this.mixerApiService
          .upsertVersion(dataModelDto)
          .then((dataModelResponse) => {
            if (dataModelResponse.errors.length) {
              reject(dataModelResponse.errors);
            } else {
              resolve(
                this.dataModelDataMapper.deserialize(dataModelResponse.result)
              );
            }
          });
      });
    });
  }

  /**
   * Updates Data Model metadata (name, description...etc.)
   * @param dto CreateDataModelDTO
   */
  updateDataModel(dto: UpdateDataModelDTO): Promise<DataModel> {
    throw 'Not implemented';
  }

  /**
   * Publishes new or updates the current data model version
   * depending on the specified conflictMode.
   *
   * @param dataModelVersion - DataModelVersion
   * @param conflictMode - NEW_VERSION | PATCH
   */
  publishDataModelVersion(
    dto: CreateDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<DataModelVersion> {
    throw 'Not implemented';
  }

  /**
   * Deletes the specified Data Model including all versions
   * And the data related with it.
   */
  deleteDataModel(dto: DeleteDataModelDTO): Promise<unknown> {
    throw 'Not implemented';
  }

  /**
   * Validates Data Model GraphQL.
   * Checks for sytax errors, unsupported features, breaking changes
   * @param dto
   * @param validateBreakingChanges
   */
  validateDataModel(
    dto: CreateDataModelVersionDTO,
    validateBreakingChanges?: boolean
  ): Promise<DataModelValidationError[]> {
    throw 'Not implemented';
  }

  /**
   * Run GraphQL query against a Data Model Version
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    throw 'Not implemented';
  }

  /**
   * Returns the data as Paginated Response for a type.
   * @param dto
   */
  fetchData(dto: FetchDataDTO): Promise<PaginatedResponse> {
    throw 'Not implemented';
  }

  /**
   * Ingest data model type instances (data).
   * @param dto
   */
  ingestInstances(
    dto: IngestInstancesDTO
  ): Promise<IngestInstancesResponseDTO> {
    throw 'Not implemented';
  }

  /**
   * Deletes Data Model Type Instances (data)
   * @param dto
   */
  deleteInstances(dto: DeleteInstancesDTO): Promise<boolean> {
    throw 'Not implemented';
  }

  /**
   * Returns the transformations created for the specified data model type.
   * @param dto
   */
  getTransformations(
    dto: FetchDataModelTransformationsDTO
  ): Promise<DataModelTransformation[]> {
    throw 'Not implemented';
  }

  createTransformation(
    dto: CreateDataModelTransformationDTO
  ): Promise<DataModelTransformation> {
    throw 'Not implemented';
  }

  /**
   * Fetches the number of published rows by type
   * @param dto
   */
  fetchPublishedRowsCount(
    dto: FetchPublishedRowsCountDTO
  ): Promise<PublishedRowsCountMap> {
    throw 'Not implemented';
  }
}
