import { TemplateGroupVersion } from '@cognite/sdk';
import { SolutionSchema, SolutionSchemaStatus } from '../../types';

export class TemplateSchemaDataMapper {
  serialize(
    externalId: string,
    solutionSchema: SolutionSchema
  ): TemplateGroupVersion {
    return {
      createdTime: +solutionSchema.schema,
      lastUpdatedTime: +solutionSchema.lastUpdatedTime,
      schema: solutionSchema.schema,
      version: +solutionSchema.version,
    } as TemplateGroupVersion;
  }

  deserialize(
    externalId: string,
    templateGroupVersion: TemplateGroupVersion
  ): SolutionSchema {
    return {
      externalId,
      status: SolutionSchemaStatus.PUBLISHED,
      version: templateGroupVersion.version.toString(),
      createdTime: +templateGroupVersion.createdTime,
      lastUpdatedTime: +templateGroupVersion.lastUpdatedTime,
      schema: templateGroupVersion.schema,
    };
  }
}
