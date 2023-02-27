import { DataModel } from '@platypus-core/domain/data-model/types';
import { GraphQlDmlVersionDTO } from '../dto/mixer-api-dtos';

export class DataModelDataMapper {
  serialize(dataModel: DataModel): GraphQlDmlVersionDTO {
    return {
      space: dataModel.name,
      externalId: dataModel.id,
      name: dataModel.name,
      description: dataModel.description,
      version: dataModel.version,
      createdTime: dataModel.createdTime,
      lastUpdatedTime: dataModel.updatedTime,
    };
  }

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
    } as DataModel;
  }
}
