import { BaseApiService } from './base-api.service';
import {
  ListQueryParams,
  ContainerInstance,
  ContainerReference,
} from '../../dto/dms-container-dtos';
import { ItemList, ItemsWithCursor } from '../../dto/dms-common-dtos';

export class ContainersApiService extends BaseApiService {
  list(
    queryParams?: ListQueryParams
  ): Promise<ItemsWithCursor<ContainerInstance>> {
    return this.sendGetRequest('containers', queryParams ?? {});
  }

  getByIds(items: ContainerReference[]): Promise<ItemList<ContainerInstance>> {
    return this.sendPostRequest('containers/byids', {
      items: items,
    });
  }

  delete(items: ContainerReference[]): Promise<''> {
    return this.sendPostRequest('containers/delete', {
      items: items,
    });
  }
}
