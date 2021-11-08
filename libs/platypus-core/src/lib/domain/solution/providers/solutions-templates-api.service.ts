import { CogniteClient } from '@cognite/sdk';
import { ISolutionsApiService } from '../boundaries';
import { CreateSolutionDTO, DeleteSolutionDTO } from '../dto';
import { Solution } from '../types';
import { TemplatesDataMapper } from './templates-data-mapper';

export class SolutionsTemplatesApiService implements ISolutionsApiService {
  private templatesDataMapper: TemplatesDataMapper;

  constructor(private cdfClient: CogniteClient) {
    this.templatesDataMapper = new TemplatesDataMapper();
  }
  create(dto: CreateSolutionDTO): Promise<Solution> {
    const payload = [
      {
        externalId: dto.name,
        description: dto.description || '',
        owners: dto.owner ? [dto.owner] : [],
      },
    ];
    return this.cdfClient.templates.groups
      .create(payload)
      .then((templateGroups) => {
        const [createdTemplateGroup] = templateGroups;
        return this.templatesDataMapper.deserialize(createdTemplateGroup);
      });
  }

  delete(dto: DeleteSolutionDTO): Promise<unknown> {
    return this.cdfClient.templates.groups.delete([{ externalId: dto.id }], {
      ignoreUnknownIds: false,
    });
  }
  list(): Promise<Solution[]> {
    return this.cdfClient.templates.groups.list().then((templateGroups) => {
      return templateGroups.items.map((templateGroup) =>
        this.templatesDataMapper.deserialize(templateGroup)
      );
    });
  }
}
