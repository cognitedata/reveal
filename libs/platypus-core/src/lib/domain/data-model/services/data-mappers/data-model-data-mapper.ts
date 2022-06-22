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
    // Take always the latest version
    const dataModelVersion = dto.versions?.length
      ? dto.versions.sort((a, b) => (+a.version < +b.version ? 1 : -1))[0]
      : null;
    const lastUpdatedTime = dataModelVersion
      ? dataModelVersion.createdTime
      : dto.createdTime;
    const latestVersion = dataModelVersion
      ? dataModelVersion.version.toString()
      : '';

    return {
      id: dto.externalId,
      name: dto.name,
      description: dto.description,
      createdTime: lastUpdatedTime,
      updatedTime: lastUpdatedTime,
      owners: [],
      version: latestVersion,
    } as DataModel;
  }
}
