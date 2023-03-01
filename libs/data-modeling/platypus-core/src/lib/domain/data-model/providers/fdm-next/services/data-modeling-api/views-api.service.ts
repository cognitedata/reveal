import { BaseApiService } from './base-api.service';
import {
  ListQueryParams,
  ViewInstance,
  ViewReference,
} from '../../dto/dms-view-dtos';
import { ItemList, ItemsWithCursor } from '../../dto/dms-common-dtos';

export class ViewsApiService extends BaseApiService {
  list(queryParams?: ListQueryParams): Promise<ItemsWithCursor<ViewInstance>> {
    return this.sendGetRequest('views', queryParams ?? {});
  }

  getByIds(items: ViewReference[]): Promise<ItemList<ViewInstance>> {
    return this.sendPostRequest('views/byids', {
      items: items,
    });
  }

  delete(items: ViewReference[]): Promise<''> {
    return this.sendPostRequest('views/delete', {
      items: items,
    });
  }
}
