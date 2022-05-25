import { TemplateGroupVersion } from '@cognite/sdk';
import { DataModelVersion, DataModelVersionStatus } from '../../types';

export class TemplateSchemaDataMapper {
  serialize(
    externalId: string,
    solutionSchema: DataModelVersion
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
  ): DataModelVersion {
    return {
      externalId,
      status: DataModelVersionStatus.PUBLISHED,
      version: templateGroupVersion.version.toString(),
      createdTime: +templateGroupVersion.createdTime,
      lastUpdatedTime: +templateGroupVersion.lastUpdatedTime,
      schema: templateGroupVersion.schema,
    };
  }
}
