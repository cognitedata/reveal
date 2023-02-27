import { BaseApiService } from './base-api.service';
import {
  DataModelDTO,
  ListQueryParams,
  FilterParams,
  DataModelInstanceDTO,
  DataModelReference,
} from '../../dto/dms-data-model-dtos';

import { ItemList, ItemsWithCursor } from '../../dto/dms-common-dtos';

export class DataModelsApiService extends BaseApiService {
  upsert(dataModels: DataModelDTO[]): Promise<ItemList<DataModelInstanceDTO>> {
    return this.sendPostRequest('datamodels', { items: dataModels });
  }

  list(
    queryParams?: ListQueryParams
  ): Promise<ItemsWithCursor<DataModelInstanceDTO>> {
    return this.sendGetRequest('datamodels', queryParams ?? {});
  }

  filter(params: FilterParams): Promise<ItemsWithCursor<DataModelInstanceDTO>> {
    return this.sendPostRequest('datamodels/list', params);
  }

  getByIds(
    params: ItemList<DataModelReference>,
    inlineViews?: boolean
  ): Promise<ItemList<DataModelInstanceDTO>> {
    if (inlineViews) {
      return this.sendPostRequest('datamodels/byids', params, {
        inlineViews: inlineViews,
      });
    } else {
      return this.sendPostRequest('datamodels/byids', params);
    }
  }

  delete(params: ItemList<DataModelReference>): Promise<''> {
    return this.sendPostRequest('datamodels/delete', params);
  }
}
