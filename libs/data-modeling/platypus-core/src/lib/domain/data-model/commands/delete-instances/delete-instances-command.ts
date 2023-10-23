import type { CogniteClient } from '@cognite/sdk';

import { Command } from '../../../../boundaries/types';
import { InstancesApiService } from '../../providers/fdm-next';

import { DeleteInstancesDTO } from './dto';

export class DeleteInstancesCommand implements Command<boolean> {
  constructor(private instancesApiService: InstancesApiService) {}
  static create(cdfClient: CogniteClient) {
    return new DeleteInstancesCommand(new InstancesApiService(cdfClient));
  }

  /**
   * Deletes Data Model Type Instances (nodes or edges)
   * @param dto
   */
  execute(dto: DeleteInstancesDTO): Promise<boolean> {
    if (!dto.items.length) {
      return Promise.resolve(true);
    }

    return this.instancesApiService
      .delete({
        items: dto.items.map((el) => ({
          externalId: el.externalId,
          instanceType: dto.type,
          space: el.space,
        })),
      })
      .then(({ items }) => {
        if (items.length !== dto.items.length) {
          throw `Only ${items.length}/${dto.items.length} of the selected rows are deleted.`;
        }
        return Promise.resolve(true);
      });
  }
}
