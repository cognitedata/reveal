import {
  ISolutionsApiService,
  ISolutionSchemaApiService,
} from '../../boundaries';

import { Solution } from '../../types';
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
import { SolutionSchema } from '../../types';
import { SolutionsApiService } from './solutions-api.service';
import { SolutionDataMapper } from './data-mappers/solution-data-mapper';
import { PlatypusError } from '@platypus-core/boundaries/types';
import { SolutionSchemaVersionDataMapper } from './data-mappers/solution-schema-version-data-mapper';

export class SolutionMixerApiFacadeService
  implements ISolutionsApiService, ISolutionSchemaApiService
{
  private solutionDataMapper: SolutionDataMapper;
  private apiSpecVersionMapper: SolutionSchemaVersionDataMapper;
  constructor(private solutionsApiService: SolutionsApiService) {
    this.solutionDataMapper = new SolutionDataMapper();
    this.apiSpecVersionMapper = new SolutionSchemaVersionDataMapper();
  }
  createSolution(dto: CreateSolutionDTO): Promise<Solution> {
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
  deleteSolution(dto: DeleteSolutionDTO): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  listSolutions(): Promise<Solution[]> {
    return this.solutionsApiService
      .listApis()
      .then((results: SolutionApiOutputDTO[]) => {
        return results.map((result) =>
          this.solutionDataMapper.deserialize(result)
        );
      });
  }
  fetchSolution(dto: FetchSolutionDTO): Promise<Solution> {
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
  fetchSchemaVersion(dto: FetchVersionDTO): Promise<SolutionSchema> {
    return this.listSchemaVersions(dto).then(
      (versions) =>
        versions.find(
          (apiSpecVersion) =>
            apiSpecVersion.version.toString() === dto.version.toString()
        ) as SolutionSchema
    );
  }

  listSchemaVersions(dto: ListVersionsDTO): Promise<SolutionSchema[]> {
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
  publishSchema(dto: CreateSchemaDTO): Promise<SolutionSchema> {
    return this.solutionsApiService
      .publishVersion({
        apiExternalId: dto.solutionId,
        graphQl: dto.schema,
        bindings: dto.bindings,
        version: dto.version ? +dto.version : undefined,
      })
      .then((version) =>
        this.apiSpecVersionMapper.deserialize(dto.solutionId, version)
      );
  }
  updateSchema(dto: CreateSchemaDTO): Promise<SolutionSchema> {
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
