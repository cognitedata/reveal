import { ItemList } from '../../dto/dms-common-dtos';
import {
  IngestRequestDTO,
  DeleteRequestDTO,
  SlimNodeOrEdge,
} from '../../dto/dms-instances-dtos';
import { BaseApiService } from './base-api.service';

export class InstancesApiService extends BaseApiService {
  ingest(requestDto: IngestRequestDTO): Promise<ItemList<SlimNodeOrEdge>> {
    return this.sendPostRequest('instances', requestDto);
  }

  delete(requestDto: DeleteRequestDTO): Promise<''> {
    return this.sendPostRequest('instances/delete', requestDto);
  }
}
