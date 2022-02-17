import { TemplateGroupVersion } from '@cognite/sdk';
import { SolutionSchema, SolutionSchemaStatus } from '../../../types';
import { ApiVersion } from '../../../dto';

export class SolutionSchemaVersionDataMapper {
  serialize(externalId: string, solutionSchema: SolutionSchema): ApiVersion {
    return {
      createdTime: +solutionSchema.schema,
      dataModel: {
        graphqlRepresentation: solutionSchema.schema,
      },
      version: +solutionSchema.version,
    } as ApiVersion;
  }

  deserialize(externalId: string, apiSpecVersion: ApiVersion): SolutionSchema {
    return {
      externalId,
      status: SolutionSchemaStatus.PUBLISHED,
      version: apiSpecVersion.version.toString(),
      createdTime: +apiSpecVersion.createdTime,
      lastUpdatedTime: +apiSpecVersion.createdTime,
      schema: apiSpecVersion.dataModel.graphqlRepresentation,
    };
  }
}
