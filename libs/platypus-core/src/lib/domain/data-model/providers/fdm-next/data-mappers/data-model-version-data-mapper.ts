import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus-core/domain/data-model/types';
import { GraphQlDmlVersionDTO } from '../dto/mixer-api-dtos';

export class DataModelVersionDataMapper {
  deserialize({
    externalId,
    space,
    version,
    graphQlDml,
    createdTime,
    lastUpdatedTime,
  }: GraphQlDmlVersionDTO): DataModelVersion {
    return {
      externalId,
      space,
      version,
      status: DataModelVersionStatus.PUBLISHED,
      schema: graphQlDml || '',
      createdTime: new Date(createdTime || '').getTime(),
      lastUpdatedTime: new Date(lastUpdatedTime || '').getTime(),
    };
  }
}
