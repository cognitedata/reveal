import { TemplateGroup } from '@cognite/sdk';
import { Solution } from '../types';

export class TemplatesDataMapper {
  serialize(solution: Solution): TemplateGroup {
    return {
      externalId: solution.id,
      description: solution.description,
      createdTime: solution.createdTime,
      lastUpdatedTime: solution.updatedTime,
      owners: solution.owners,
    } as TemplateGroup;
  }

  deserialize(templateGroup: TemplateGroup): Solution {
    return {
      id: templateGroup.externalId,
      name: templateGroup.externalId,
      description: templateGroup.description,
      createdTime: templateGroup.createdTime,
      updatedTime: templateGroup.lastUpdatedTime,
      owners: templateGroup.owners,
    } as Solution;
  }
}
