import {
  IDataModelsApiService,
  IDataModelVersionApiService,
} from '../../boundaries';
import {
  CreateDataModelVersionDTO,
  CreateDataModelDTO,
  DeleteDataModelDTO,
  FetchDataModelDTO,
  FetchVersionDTO,
  GraphQLQueryResponse,
  ListVersionsDTO,
  RunQueryDTO,
} from '../../dto';
import { DataModel, DataModelVersion } from '../../types';
import { TemplateSchemaDataMapper } from './template-schema-data-mapper';
import { TemplatesApiService } from './templates-api.service';
import { TemplatesDataMapper } from './templates-data-mapper';

export class SolutionTemplatesFacadeService
  implements IDataModelsApiService, IDataModelVersionApiService
{
  private templatesDataMapper: TemplatesDataMapper;
  private templateSchemaDataMapper: TemplateSchemaDataMapper;
  constructor(private templatesApiService: TemplatesApiService) {
    this.templatesDataMapper = new TemplatesDataMapper();
    this.templateSchemaDataMapper = new TemplateSchemaDataMapper();
  }

  create(dto: CreateDataModelDTO): Promise<DataModel> {
    return this.templatesApiService
      .createTemplateGroup(dto)
      .then((templateGroup) =>
        this.templatesDataMapper.deserialize(templateGroup)
      );
  }

  delete(dto: DeleteDataModelDTO): Promise<unknown> {
    return this.templatesApiService.deleteTemplateGroup(dto);
  }

  list(): Promise<DataModel[]> {
    return this.templatesApiService
      .listTemplateGroups()
      .then((templateGroups) =>
        templateGroups.map((templateGroup) =>
          this.templatesDataMapper.deserialize(templateGroup)
        )
      );
  }

  fetch(dto: FetchDataModelDTO): Promise<DataModel> {
    return this.templatesApiService
      .fetchTemplateGroup({ dataModelId: dto.dataModelId })
      .then((templateGroup) =>
        this.templatesDataMapper.deserialize(templateGroup)
      );
  }

  fetchVersion(dto: FetchVersionDTO): Promise<DataModelVersion> {
    return this.templatesApiService
      .fetchSchemaVersion(dto)
      .then((version) =>
        this.templateSchemaDataMapper.deserialize(dto.dataModelId, version)
      );
  }

  listVersions(dto: ListVersionsDTO): Promise<DataModelVersion[]> {
    return this.templatesApiService.listSchemaVersions(dto).then((versions) => {
      return versions.map((templateSchemaVersion) =>
        this.templateSchemaDataMapper.deserialize(
          dto.dataModelId,
          templateSchemaVersion
        )
      );
    });
  }

  publishVersion(dto: DataModelVersion): Promise<DataModelVersion> {
    return this.templatesApiService
      .publishSchema(dto as unknown as CreateDataModelVersionDTO)
      .then((res) =>
        this.templateSchemaDataMapper.deserialize(dto.externalId, res)
      );
  }

  updateVersion(dto: CreateDataModelVersionDTO): Promise<DataModelVersion> {
    return this.templatesApiService
      .updateSchema(dto)
      .then((res) =>
        this.templateSchemaDataMapper.deserialize(dto.externalId, res)
      );
  }

  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    return this.templatesApiService.runQuery({
      graphQlParams: dto.graphQlParams,
      dataModelId: dto.dataModelId,
      schemaVersion: dto.schemaVersion,
    });
  }
}
