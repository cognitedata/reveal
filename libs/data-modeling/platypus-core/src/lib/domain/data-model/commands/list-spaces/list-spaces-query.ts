import type { CogniteClient } from '@cognite/sdk';

import { Query } from '../../../../boundaries/types';
import { SpacesApiService, SpaceInstanceDTO } from '../../providers/fdm-next';

import { ListSpacesDTO } from './dto';

export class ListSpacesQuery implements Query<SpaceInstanceDTO[]> {
  constructor(private spacesApi: SpacesApiService) {}

  static create(cdfClient: CogniteClient) {
    return new ListSpacesQuery(new SpacesApiService(cdfClient));
  }
  /**
   * Fetch all spaces.
   */
  execute(dto?: ListSpacesDTO): Promise<SpaceInstanceDTO[]> {
    return this.spacesApi.list(dto).then((response) => {
      const sortedSpaces = response.items.sort((a, b) =>
        a.space.localeCompare(b.space)
      );

      return sortedSpaces;
    });
  }
}
