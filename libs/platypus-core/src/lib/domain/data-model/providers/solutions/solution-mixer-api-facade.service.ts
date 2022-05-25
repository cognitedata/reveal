import {
  IDataModelsApiService,
  IDataModelVersionApiService,
} from '../../boundaries';

import { DataModel } from '../../types';
import {
  CreateSolutionDTO,
  DeleteSolutionDTO,
  FetchSolutionDTO,
  ListVersionsDTO,
  CreateSchemaDTO,
  RunQueryDTO,
  GraphQLQueryResponse,
  SolutionApiOutputDTO,
  FetchVersionDTO,
} from '../../dto';
import { DataModelVersion } from '../../types';
import { SolutionsApiService } from './solutions-api.service';
import { SolutionDataMapper } from './data-mappers/solution-data-mapper';
import { PlatypusError } from '@platypus-core/boundaries/types';
import { SolutionSchemaVersionDataMapper } from './data-mappers/solution-schema-version-data-mapper';

export class SolutionMixerApiFacadeService
  implements IDataModelsApiService, IDataModelVersionApiService
{
  private solutionDataMapper: SolutionDataMapper;
  private apiSpecVersionMapper: SolutionSchemaVersionDataMapper;
  constructor(private solutionsApiService: SolutionsApiService) {
    this.solutionDataMapper = new SolutionDataMapper();
    this.apiSpecVersionMapper = new SolutionSchemaVersionDataMapper();
  }
  create(dto: CreateSolutionDTO): Promise<DataModel> {
    return this.solutionsApiService
      .upsertApi({
        externalId: dto.name,
        description: dto.description || '',
        name: dto.name,
        metadata: dto.metadata || {},
      })
      .then((createApiResponse) =>
        this.solutionDataMapper.deserialize(createApiResponse)
      );
  }
  delete(dto: DeleteSolutionDTO): Promise<unknown> {
    return this.solutionsApiService.deleteApi(dto.id);
  }
  list(): Promise<DataModel[]> {
    return this.solutionsApiService
      .listApis()
      .then((results: SolutionApiOutputDTO[]) => {
        return results.map((result) =>
          this.solutionDataMapper.deserialize(result)
        );
      });
  }
  fetch(dto: FetchSolutionDTO): Promise<DataModel> {
    return this.solutionsApiService
      .getApisByIds(dto.solutionId, false)
      .then((results) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.solutionId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }
        return this.solutionDataMapper.deserialize(results[0]);
      });
  }
  fetchVersion(dto: FetchVersionDTO): Promise<DataModelVersion> {
    return this.listVersions(dto).then(
      (versions) =>
        versions.find(
          (apiSpecVersion) =>
            apiSpecVersion.version.toString() === dto.version.toString()
        ) as DataModelVersion
    );
  }

  listVersions(dto: ListVersionsDTO): Promise<DataModelVersion[]> {
    return this.solutionsApiService
      .getApisByIds(dto.solutionId, true)
      .then((results: SolutionApiOutputDTO[]) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.solutionId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }
        // eslint-disable-next-line
        const versions = results[0].versions!;
        return versions.map((version) =>
          this.apiSpecVersionMapper.deserialize(dto.solutionId, version)
        );
      });
  }
  publishVersion(dto: CreateSchemaDTO): Promise<DataModelVersion> {
    return this.solutionsApiService
      .publishVersion({
        apiExternalId: dto.solutionId,
        graphQl: dto.schema,
        bindings: dto.bindings,
        version: dto.version ? +dto.version : 1,
      })
      .then((version) =>
        this.apiSpecVersionMapper.deserialize(dto.solutionId, version)
      );
  }
  updateVersion(dto: CreateSchemaDTO): Promise<DataModelVersion> {
    return this.solutionsApiService
      .updateVersion({
        apiExternalId: dto.solutionId,
        graphQl: dto.schema,
        bindings: dto.bindings,
        version: dto.version ? +dto.version : undefined,
      })
      .then((version) =>
        this.apiSpecVersionMapper.deserialize(dto.solutionId, version)
      );
  }
  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const reqDto = {
      ...dto,
      extras: { ...dto.extras, apiName: dto.solutionId },
    } as RunQueryDTO;

    return this.solutionsApiService
      .runQuery(reqDto) // return type GraphQlResponse
      .then((value) => value)
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }
}
