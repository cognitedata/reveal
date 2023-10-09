import { DataModel } from '../../../types';
import { GraphQlDmlVersionDTO } from '../dto/mixer-api-dtos';

export class DataModelDataMapper {
  deserialize(dto: GraphQlDmlVersionDTO): DataModel {
    return {
      id: dto.externalId,
      name: dto.name,
      description: dto.description,
      createdTime: dto.createdTime,
      updatedTime: dto.lastUpdatedTime,
      version: dto.version,
      owners: [],
      space: dto.space,
      graphQlDml: dto.graphQlDml,
    } as DataModel;
  }
}
