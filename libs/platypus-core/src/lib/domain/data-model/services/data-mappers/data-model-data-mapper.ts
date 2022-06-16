import { DataModel } from '../../types';
import { DataModelApiOutputDTO } from '../../dto';

export class DataModelDataMapper {
  serialize(solution: DataModel): DataModelApiOutputDTO {
    return {
      externalId: solution.id,
      name: solution.id,
      description: solution.description,
      createdTime: solution.createdTime,
    } as DataModelApiOutputDTO;
  }

  deserialize(dto: DataModelApiOutputDTO): DataModel {
    return {
      id: dto.externalId,
      name: dto.name,
      description: dto.description,
      createdTime: dto.createdTime,
      updatedTime: dto.createdTime,
      owners: [],
      version: dto.versions?.length ? dto.versions[0].version.toString() : '',
    } as DataModel;
  }
}
