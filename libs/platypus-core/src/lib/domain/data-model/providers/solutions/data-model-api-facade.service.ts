import {
  IDataModelsApiService,
  IDataModelVersionApiService,
  IGraphQlUtilsService,
} from '../../boundaries';

import { DataModel, DataModelVersionStatus } from '../../types';
import {
  CreateDataModelDTO,
  DeleteDataModelDTO,
  FetchDataModelDTO,
  ListVersionsDTO,
  RunQueryDTO,
  GraphQLQueryResponse,
  DataModelApiOutputDTO,
  FetchVersionDTO,
  ConflictMode,
  CreateDataModelVersionDTO,
} from '../../dto';
import { DataModelVersion } from '../../types';
import { MixerApiService } from './mixer-api.service';
import { SolutionDataMapper } from './data-mappers/solution-data-mapper';
import { PlatypusError } from '@platypus-core/boundaries/types';
import { SolutionSchemaVersionDataMapper } from './data-mappers/solution-schema-version-data-mapper';
import { DataModelStorageApiService } from './data-model-storage-api.service';
import { DataModelStorageBuilderService } from './data-model-storage-builder.service';

export class DataModelApiFacadeService
  implements IDataModelsApiService, IDataModelVersionApiService
{
  private solutionDataMapper: SolutionDataMapper;
  private apiSpecVersionMapper: SolutionSchemaVersionDataMapper;
  private dmsServiceBuilder: DataModelStorageBuilderService;
  constructor(
    private solutionsApiService: MixerApiService,
    private dmsApiService: DataModelStorageApiService,
    private graphqlService: IGraphQlUtilsService
  ) {
    this.solutionDataMapper = new SolutionDataMapper();
    this.apiSpecVersionMapper = new SolutionSchemaVersionDataMapper();
    this.dmsServiceBuilder = new DataModelStorageBuilderService();
  }

  async create(dto: CreateDataModelDTO): Promise<DataModel> {
    const externalId = this.convertToCamelCase(dto.name);
    const createApiResponse = await this.solutionsApiService.upsertApi({
      externalId,
      description: dto.description || '',
      name: dto.name,
      metadata: dto.metadata || {},
    });

    await this.dmsApiService.applySpaces([{ externalId }]);

    const createdDataModel =
      this.solutionDataMapper.deserialize(createApiResponse);

    return createdDataModel;
  }

  delete(dto: DeleteDataModelDTO): Promise<unknown> {
    return this.solutionsApiService.deleteApi(dto.id);
  }
  list(): Promise<DataModel[]> {
    return this.solutionsApiService
      .listApis()
      .then((results: DataModelApiOutputDTO[]) => {
        return results.map((result) =>
          this.solutionDataMapper.deserialize(result)
        );
      });
  }
  fetch(dto: FetchDataModelDTO): Promise<DataModel> {
    return this.solutionsApiService
      .getApisByIds(dto.dataModelId, false)
      .then((results) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.dataModelId} does not exist!`,
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
      .getApisByIds(dto.dataModelId, true)
      .then((results: DataModelApiOutputDTO[]) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.dataModelId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }
        // eslint-disable-next-line
        const versions = results[0].versions!;
        return versions.map((version) =>
          this.apiSpecVersionMapper.deserialize(dto.dataModelId, version)
        );
      });
  }
  async publishVersion(
    dto: CreateDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<DataModelVersion> {
    // Create DataModelVersion out of request obj
    const dataModelVersionDto = {
      createdTime: dto.createdTime || Date.now(),
      lastUpdatedTime: dto.lastUpdatedTime || Date.now(),
      externalId: dto.externalId,
      schema: dto.schema,
      status: dto.status || DataModelVersionStatus.PUBLISHED,
      version: dto.version,
    } as DataModelVersion;

    let version;

    const dataModelVersion = dto.version ? +dto.version : 1;

    const dataModelVersionCreateDto = {
      apiExternalId: dto.externalId,
      graphQl: dto.schema,
      bindings: dto.bindings,
      version: dataModelVersion,
    };

    // if bindings are provided, that would mean that the user is
    // controlling the storage and bindings manually using CLI
    if (dto.bindings) {
      // Patch the API and set new bindings
      version = await this.solutionsApiService.publishVersion(
        dataModelVersionCreateDto,
        'PATCH'
      );
      return this.apiSpecVersionMapper.deserialize(dto.externalId, version);
    } else {
      // if no bindings are provided then try to autogenerate them
      const typeDefs = this.graphqlService.parseSchema(dto.schema);
      const bindings = this.dmsServiceBuilder.buildBindings(
        dto.externalId,
        dataModelVersionDto,
        typeDefs
      );

      const models = this.dmsServiceBuilder.buildModels(
        dto.externalId,
        dataModelVersionDto,
        typeDefs
      );

      // Hack for now!
      // We need to validate everything first before creating DMS
      // However if we send the bindings in the first call to Mixer API
      // Validation will fail and it will complain that DMS Model Does not exist
      // Solution is first to do MixerAPi validation with empty bindings
      let version = await this.solutionsApiService.publishVersion(
        {
          ...dataModelVersionCreateDto,
          bindings: [],
        },
        conflictMode
      );

      // Create DMS models
      await this.dmsApiService.upsertModel(models);

      // Patch the API and set new bindings
      version = await this.solutionsApiService.publishVersion(
        {
          ...dataModelVersionCreateDto,
          bindings,
        },
        'PATCH'
      );
      return this.apiSpecVersionMapper.deserialize(dto.externalId, version);
    }
  }

  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const reqDto = {
      ...dto,
      extras: { ...dto.extras, apiName: dto.dataModelId },
    } as RunQueryDTO;

    return this.solutionsApiService
      .runQuery(reqDto) // return type GraphQlResponse
      .then((value) => value)
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  private convertToCamelCase(input: string) {
    const regex = /\s+(\w)?/gi;

    return input
      .toLowerCase()
      .replace(regex, (match, letter) => letter.toUpperCase());
  }
}
