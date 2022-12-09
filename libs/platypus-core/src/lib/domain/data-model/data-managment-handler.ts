import { Result } from '../../boundaries/types';
import { FlexibleDataModelingClient } from './boundaries';
import {
  CreateDataModelTransformationDTO,
  DeleteInstancesDTO,
  ListDataDTO,
  FetchDataModelTransformationsDTO,
  FetchPublishedRowsCountDTO,
  IngestEdgeDTO,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
  PublishedRowsCountMap,
  SearchDataDTO,
} from './dto';

import { PaginatedResponse } from './types';

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

  fetchData(dto: ListDataDTO): Promise<Result<PaginatedResponse>> {
    return new Promise((resolve, reject) => {
      this.fdmClient
        .fetchData(dto)
        .then((result) => {
          resolve(Result.ok(result));
        })
        .catch((error) => reject(Result.fail(error)));
    });
  }

  searchData(dto: SearchDataDTO) {
    return this.fdmClient
      .searchData(dto)
      .then((result) => Result.ok(result))
      .catch((error) => Promise.reject(Result.fail(error)));
  }

  getTransformations(dto: FetchDataModelTransformationsDTO) {
    return this.fdmClient.getTransformations(dto);
  }

  createTransformation(dto: CreateDataModelTransformationDTO) {
    return this.fdmClient.createTransformation(dto);
  }

  deleteData(dto: Omit<DeleteInstancesDTO, 'type'>): Promise<Result<boolean>> {
    if (!dto.items.length) {
      return Promise.resolve(Result.ok(true));
    }

    return this.fdmClient
      .deleteInstances({ ...dto, type: 'node' })
      .then(() => Result.ok(true))
      .catch((error) => Result.fail(error));
  }

  ingestNodes(
    dto: Omit<IngestInstancesDTO, 'type'>
  ): Promise<IngestInstancesResponseDTO> {
    return this.fdmClient.ingestInstances({ ...dto, type: 'node' });
  }

  ingestEdges(
    dto: Omit<IngestInstancesDTO, 'type'> & { items: IngestEdgeDTO[] }
  ) {
    return this.fdmClient.ingestInstances({ ...dto, type: 'edge' });
  }

  deleteEdges(dto: Omit<DeleteInstancesDTO, 'type'>) {
    if (!dto.items.length) {
      return Promise.resolve(Result.ok(true));
    }
    return this.fdmClient.deleteInstances({ ...dto, type: 'edge' });
  }
}
