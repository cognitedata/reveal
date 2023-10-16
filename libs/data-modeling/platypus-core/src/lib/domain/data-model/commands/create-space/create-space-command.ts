import type { CogniteClient } from '@cognite/sdk';

import { Command, PlatypusError } from '../../../../boundaries/types';
import {
  SpaceDTO,
  SpaceInstanceDTO,
  SpacesApiService,
} from '../../providers/fdm-next';

export class CreateSpaceCommand implements Command<SpaceInstanceDTO> {
  constructor(private spacesApi: SpacesApiService) {}

  static create(cdfClient: CogniteClient) {
    return new CreateSpaceCommand(new SpacesApiService(cdfClient));
  }

  /**
   * Creates a new space for data models.
   * @param dto
   */
  async execute(dto: SpaceDTO): Promise<SpaceInstanceDTO> {
    try {
      const space = this.spacesApi.upsert([dto]).then((res) => res.items[0]);

      return space;
    } catch (err) {
      if (
        (err as PlatypusError).code === 400 ||
        (err as PlatypusError).code === 409
      ) {
        return Promise.reject({
          name: (err as PlatypusError).message,
        });
      }

      return Promise.reject(err);
    }
  }
}
