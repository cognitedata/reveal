import { SolutionSchema, SolutionSchemaStatus } from '../../../types';
import { ApiVersion } from '../../../dto';

export class SolutionSchemaVersionDataMapper {
  serialize(externalId: string, solutionSchema: SolutionSchema): ApiVersion {
    return {
      createdTime: new Date(solutionSchema.createdTime).toISOString(),
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
      createdTime: new Date(apiSpecVersion.createdTime).getTime(),
      lastUpdatedTime: new Date(apiSpecVersion.createdTime).getTime(),
      schema: apiSpecVersion.dataModel.graphqlRepresentation,
    };
  }
}
