import {
  ISolutionsApiService,
  ISolutionSchemaApiService,
} from '../../boundaries';
import {
  CreateSchemaDTO,
  CreateSolutionDTO,
  DeleteSolutionDTO,
  FetchSolutionDTO,
  FetchVersionDTO,
  GraphQLQueryResponse,
  ListVersionsDTO,
  RunQueryDTO,
} from '../../dto';
import { Solution, SolutionSchema } from '../../types';
import { TemplateSchemaDataMapper } from './template-schema-data-mapper';
import { TemplatesApiService } from './templates-api.service';
import { TemplatesDataMapper } from './templates-data-mapper';

export class SolutionTemplatesFacadeService
  implements ISolutionsApiService, ISolutionSchemaApiService
{
  private templatesDataMapper: TemplatesDataMapper;
  private templateSchemaDataMapper: TemplateSchemaDataMapper;
  constructor(private templatesApiService: TemplatesApiService) {
    this.templatesDataMapper = new TemplatesDataMapper();
    this.templateSchemaDataMapper = new TemplateSchemaDataMapper();
  }

  createSolution(dto: CreateSolutionDTO): Promise<Solution> {
    return this.templatesApiService
      .createTemplateGroup(dto)
      .then((templateGroup) =>
        this.templatesDataMapper.deserialize(templateGroup)
      );
  }

  deleteSolution(dto: DeleteSolutionDTO): Promise<unknown> {
    return this.templatesApiService.deleteTemplateGroup(dto);
  }

  listSolutions(): Promise<Solution[]> {
    return this.templatesApiService
      .listTemplateGroups()
      .then((templateGroups) =>
        templateGroups.map((templateGroup) =>
          this.templatesDataMapper.deserialize(templateGroup)
        )
      );
  }

  fetchSolution(dto: FetchSolutionDTO): Promise<Solution> {
    return this.templatesApiService
      .fetchTemplateGroup({ solutionId: dto.solutionId })
      .then((templateGroup) =>
        this.templatesDataMapper.deserialize(templateGroup)
      );
  }

  fetchSchemaVersion(dto: FetchVersionDTO): Promise<SolutionSchema> {
    return this.templatesApiService
      .fetchSchemaVersion(dto)
      .then((version) =>
        this.templateSchemaDataMapper.deserialize(dto.solutionId, version)
      );
  }

  listSchemaVersions(dto: ListVersionsDTO): Promise<SolutionSchema[]> {
    return this.templatesApiService.listSchemaVersions(dto).then((versions) => {
      return versions.map((templateSchemaVersion) =>
        this.templateSchemaDataMapper.deserialize(
          dto.solutionId,
          templateSchemaVersion
        )
      );
    });
  }

  publishSchema(dto: CreateSchemaDTO): Promise<SolutionSchema> {
    return this.templatesApiService
      .publishSchema(dto)
      .then((res) =>
        this.templateSchemaDataMapper.deserialize(dto.solutionId, res)
      );
  }

  updateSchema(dto: CreateSchemaDTO): Promise<SolutionSchema> {
    return this.templatesApiService
      .updateSchema(dto)
      .then((res) =>
        this.templateSchemaDataMapper.deserialize(dto.solutionId, res)
      );
  }

  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    return this.templatesApiService.runQuery({
      graphQlParams: dto.graphQlParams,
      solutionId: dto.solutionId,
      schemaVersion: dto.schemaVersion,
    });
  }
}
