import { CogniteClient } from '@cognite/sdk';
import { Solution } from '../types';
import { TemplatesDataMapper } from './templates-data-mapper';

export class SolutionsTemplatesApiService {
  private templatesDataMapper: TemplatesDataMapper;

  constructor(private cdfClient: CogniteClient) {
    this.templatesDataMapper = new TemplatesDataMapper();
  }
  create() {
    // not implemented
    return Promise.resolve(true);
  }
  update() {
    // not implemented
    return Promise.resolve(true);
  }
  delete() {
    // not implemented
    return Promise.resolve(true);
  }
  list(): Promise<Solution[]> {
    return this.cdfClient.templates.groups.list().then((templateGroups) => {
      return templateGroups.items.map((templateGroup) =>
        this.templatesDataMapper.deserialize(templateGroup)
      );
    });
  }
}
