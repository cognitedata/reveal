import { Solution } from '../../../types';
import { SolutionApiOutputDTO } from '../../../dto';

export class SolutionDataMapper {
  serialize(solution: Solution): SolutionApiOutputDTO {
    return {
      externalId: solution.id,
      name: solution.id,
      description: solution.description,
      createdTime: solution.createdTime,
    } as SolutionApiOutputDTO;
  }

  deserialize(dto: SolutionApiOutputDTO): Solution {
    return {
      id: dto.externalId,
      name: dto.name,
      description: dto.description,
      createdTime: dto.createdTime,
      updatedTime: dto.createdTime,
      owners: [],
      version: dto.versions?.length ? dto.versions[0].version.toString() : '',
    } as Solution;
  }
}
