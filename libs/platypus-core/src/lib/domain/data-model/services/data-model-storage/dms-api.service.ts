import { CogniteClient } from '@cognite/sdk';

import {
  DataModelStorageModelsDTO,
  DmsListModelsRequestDTO,
  DataModelSpaceDTO,
  DmsDeleteDataModelRequestDTO,
  DmsIngestNodesRequestDTO,
  DmsIngestNodesResponseDTO,
  DmsDeleteNodesRequestDTO,
  FilterNodesRequestDTO,
  FilterNodesResponseDTO,
  DmsIngestEdgesRequestDTO,
  DmsIngestEdgesResponseDTO,
  DmsDeleteEdgesRequestDTO,
  RetrieveEdgesByIdsRequestDTO,
  RetrieveEdgesByIdsResponseDTO,
} from '../../dto';

import { DataModelStorageModel } from '../../types';
import { PlatypusError } from '@platypus-core/boundaries/types';

/**
 * Data Model Storage API
 * Docs can be found here:
 * https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#tag/Models
 */
export class DmsApiService {
  constructor(private readonly cdfClient: CogniteClient) {}

  /******* Spaces Apis **********/

  listSpaces(): Promise<DataModelSpaceDTO[]> {
    return this.sendApiRequest('spaces/list', {}).then(
      (res) => res.items as DataModelSpaceDTO[]
    );
  }

  applySpaces(dto: DataModelSpaceDTO[]): Promise<DataModelSpaceDTO[]> {
    return this.sendApiRequest('spaces', { items: dto }).then(
      (res) => res.items as DataModelSpaceDTO[]
    );
  }

  deleteSpaces(dto: DataModelSpaceDTO[]): Promise<DataModelSpaceDTO[]> {
    return this.sendApiRequest('spaces/delete', { items: dto }).then(
      (res) => res.items as DataModelSpaceDTO[]
    );
  }

  getSpacesById(dto: DataModelSpaceDTO[]): Promise<DataModelSpaceDTO[]> {
    return this.sendApiRequest('spaces/byids', dto).then(
      (res) => res.items as DataModelSpaceDTO[]
    );
  }

  /******* Spaces Apis **********/

  /******* Models Apis **********/

  /** List models for a project */
  listModels(dto: DmsListModelsRequestDTO): Promise<DataModelStorageModel[]> {
    return this.sendApiRequest('models/list', dto).then(
      (res) => res.items as DataModelStorageModel[]
    );
  }

  /** Apply models for a project. Apply will fail if making incompatible changes. */
  upsertModel(
    dto: DataModelStorageModelsDTO
  ): Promise<DataModelStorageModel[]> {
    return this.sendApiRequest('models', dto).then((res) => {
      return res.items as DataModelStorageModel[];
    });
  }

  /** Delete models for a project. */
  deleteModel(dto: DmsDeleteDataModelRequestDTO): Promise<void> {
    return this.sendApiRequest('models/delete', dto);
  }
  /******* Models Apis **********/

  /******* Nodes Apis **********/

  /** Ingest nodes(data) into storage for a project. */
  ingestNodes(
    dto: DmsIngestNodesRequestDTO
  ): Promise<DmsIngestNodesResponseDTO> {
    return this.sendApiRequest('nodes', dto).then(
      (res) => res as DmsIngestNodesResponseDTO
    );
  }

  /** List nodes in a project matching a given filter. */
  filterNodes(dto: FilterNodesRequestDTO): Promise<FilterNodesResponseDTO> {
    return this.sendApiRequest('nodes/list', dto).then(
      (res) => res as FilterNodesResponseDTO
    );
  }

  /** Delete Ingested nodes(data) for a project. */
  deleteNodes(dto: DmsDeleteNodesRequestDTO): Promise<void> {
    return this.sendApiRequest('nodes/delete', dto);
  }
  /******* Nodes Apis **********/

  /******* Edges Apis **********/
  /** Ingest edges to connect nodes */
  ingestEdges(
    dto: DmsIngestEdgesRequestDTO
  ): Promise<DmsIngestEdgesResponseDTO> {
    return this.sendApiRequest('edges', dto).then(
      (res) => res as DmsIngestEdgesResponseDTO
    );
  }

  /** Delete edges in a project. Will delete all data for all models on the specified externalIds. */
  deleteEdges(dto: DmsDeleteEdgesRequestDTO): Promise<void> {
    return this.sendApiRequest('edges/delete', dto);
  }

  /** List edges in a project matching a given filter. */
  filterEdges(
    dto: RetrieveEdgesByIdsRequestDTO
  ): Promise<RetrieveEdgesByIdsResponseDTO> {
    return this.sendApiRequest('edges/byids', dto).then(
      (res) => res as DmsIngestEdgesResponseDTO
    );
  }

  /** Retrieve edges by their external IDs. */
  retrieveEdgesByIds(
    dto: RetrieveEdgesByIdsRequestDTO
  ): Promise<RetrieveEdgesByIdsResponseDTO> {
    return this.sendApiRequest('edges/byids', dto).then(
      (res) => res as DmsIngestEdgesResponseDTO
    );
  }
  /******* Edges Apis **********/

  async sendApiRequest(apiPath: string, payload: any): Promise<any> {
    const apiUrl = `/api/v1/projects/${this.cdfClient.project}/datamodelstorage/${apiPath}`;
    return new Promise((resolve, reject) => {
      this.cdfClient
        .post(apiUrl, {
          data: payload,
          headers: {
            'cdf-version': 'alpha',
          },
        })
        .then((response) => {
          if (response.data.errors) {
            reject({ status: 400, errors: [...response.data.errors] });
          } else {
            resolve(response.data);
          }
        })
        .catch((err) => reject(PlatypusError.fromSdkError(err)));
    });
  }
}
