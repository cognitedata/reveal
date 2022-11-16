import { Result } from '../../boundaries/types';
import { FlexibleDataModelingClient } from './boundaries';
import {
  CreateDataModelTransformationDTO,
  DeleteInstancesDTO,
  FetchDataDTO,
  FetchDataModelTransformationsDTO,
  FetchPublishedRowsCountDTO,
  IngestInstanceDTO,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
  PublishedRowsCountMap,
} from './dto';

import { UnnormalizedDmsIngestNodesItemDTO } from './providers/fdm-current';

import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  PaginatedResponse,
} from './types';

export class DataManagementHandler {
  constructor(private fdmClient: FlexibleDataModelingClient) {}

  fetchPublishedRowsCount(
    dto: FetchPublishedRowsCountDTO
  ): Promise<Result<PublishedRowsCountMap>> {
    return new Promise((resolve, reject) =>
      this.fdmClient
        .fetchPublishedRowsCount(dto)
        .then((res) => {
          resolve(Result.ok(res));
        })
        .catch((err) => {
          reject(Result.fail(err));
        })
    );
  }

  fetchData(dto: FetchDataDTO): Promise<Result<PaginatedResponse>> {
    return new Promise((resolve, reject) => {
      this.fdmClient
        .fetchData(dto)
        .then((result) => {
          resolve(Result.ok(result));
        })
        .catch((error) => reject(Result.fail(error)));
    });
  }

  getTransformations(dto: FetchDataModelTransformationsDTO) {
    return this.fdmClient.getTransformations(dto);
  }

  createTransformation(dto: CreateDataModelTransformationDTO) {
    return this.fdmClient.createTransformation(dto);
  }

  deleteData(dto: DeleteInstancesDTO): Promise<Result<boolean>> {
    if (!dto.items.length) {
      return Promise.resolve(Result.ok(true));
    }

    return this.fdmClient
      .deleteInstances(dto)
      .then(() => Result.ok(true))
      .catch((error) => Result.fail(error));
  }

  ingestNodes(dto: IngestInstancesDTO): Promise<IngestInstancesResponseDTO> {
    const { items, dataModelExternalId, dataModelType, dataModelTypeDefs } =
      dto;

    dto.items = this.normalizeIngestionItem(
      items,
      dataModelExternalId,
      dataModelType,
      dataModelTypeDefs
    );

    return this.fdmClient.ingestInstances(dto);
  }

  isRelationshipField(
    field: string,
    dataModelType: DataModelTypeDefsType,
    dataModelTypeDefs: DataModelTypeDefs
  ): boolean {
    return this.getRelationshipFields(
      dataModelType,
      dataModelTypeDefs
    ).includes(field);
  }

  /*
Replace relationships with correct ingestion format.
Must be on the format [spaceExternalId, externalId] or null instead of {externalId} or null
*/
  private normalizeIngestionItem(
    items: UnnormalizedDmsIngestNodesItemDTO[],
    dataModelExternalId: string,
    dataModelType: DataModelTypeDefsType,
    dataModelTypeDefs: DataModelTypeDefs
  ): IngestInstanceDTO[] {
    const relationshipFields = new Set(
      this.getRelationshipFields(dataModelType, dataModelTypeDefs)
    );
    return items.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => {
          if (
            relationshipFields.has(key) &&
            value !== null &&
            typeof value === 'object'
          ) {
            const externalId = value.externalId;
            if (externalId === '') {
              return [key, null];
            } else {
              return [key, [dataModelExternalId, externalId]];
            }
          } else {
            return [key, value];
          }
        })
      )
    );
  }

  private getRelationshipFields(
    dataModelType: DataModelTypeDefsType,
    dataModelTypeDefs: DataModelTypeDefs
  ): string[] {
    const modelTypeNames = new Set(
      dataModelTypeDefs.types.map((modelTypeDef) => modelTypeDef.name)
    );
    return dataModelType.fields
      .filter((field) => modelTypeNames.has(field.type.name))
      .map((field) => field.name);
  }
}
