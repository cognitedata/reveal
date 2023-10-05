import {
  DataModelVersion,
  DataModelVersionStatus,
} from '../../../../../domain/data-model';
import { GraphQlDmlVersionDTO } from '../dto/mixer-api-dtos';

export class DataModelVersionDataMapper {
  deserialize({
    name,
    description,
    externalId,
    space,
    version,
    graphQlDml,
    createdTime,
    lastUpdatedTime,
    views,
  }: GraphQlDmlVersionDTO): DataModelVersion {
    return {
      name,
      description,
      externalId,
      space,
      version,
      status: DataModelVersionStatus.PUBLISHED,
      schema: graphQlDml || '',
      views,
      createdTime: new Date(createdTime || '').getTime(),
      lastUpdatedTime: new Date(lastUpdatedTime || '').getTime(),
    };
  }
}
