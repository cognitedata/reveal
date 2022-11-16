import { BaseApiService } from './base-api.service';
import {
  ListQueryParams,
  SearchParams,
  SpaceDTO,
  SpaceInstanceDTO,
} from '../../dto/dms-space-dtos';
import { ItemList, ItemsWithCursor } from '../../dto/dms-common-dtos';

export class SpacesApiService extends BaseApiService {
  upsert(spaces: SpaceDTO[]): Promise<ItemList<SpaceInstanceDTO>> {
    return this.sendPostRequest('spaces', { items: spaces });
  }

  list(
    queryParams?: ListQueryParams
  ): Promise<ItemsWithCursor<SpaceInstanceDTO>> {
    return this.sendGetRequest('spaces', queryParams ?? {});
  }

  getByIds(items: string[]): Promise<ItemList<SpaceInstanceDTO>> {
    return this.sendPostRequest('spaces/byids', {
      items: items,
    });
  }

  search(params: SearchParams): Promise<ItemList<SpaceInstanceDTO>> {
    return this.sendPostRequest('datamodels/delete', params);
  }

  delete(items: Array<string>): Promise<''> {
    return this.sendPostRequest('spaces/delete', {
      items: items,
    });
  }
}
