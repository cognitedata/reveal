import { TemplateGroup } from '@cognite/sdk';
import { DataModel } from '../../types';

export class TemplatesDataMapper {
  serialize(solution: DataModel): TemplateGroup {
    return {
      externalId: solution.id,
      description: solution.description,
      createdTime: solution.createdTime,
      lastUpdatedTime: solution.updatedTime,
      owners: solution.owners,
    } as TemplateGroup;
  }

  deserialize(templateGroup: TemplateGroup): DataModel {
    return {
      id: templateGroup.externalId,
      name: templateGroup.externalId,
      description: templateGroup.description,
      createdTime: templateGroup.createdTime,
      updatedTime: templateGroup.lastUpdatedTime,
      owners: templateGroup.owners,
    } as DataModel;
  }
}
