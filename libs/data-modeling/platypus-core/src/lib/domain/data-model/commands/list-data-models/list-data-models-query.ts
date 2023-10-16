import type { CogniteClient } from '@cognite/sdk';

import { Query } from '../../../../boundaries/types';
import { FdmMixerApiService } from '../../providers/fdm-next';
import { DataModelDataMapper } from '../../providers/fdm-next/data-mappers';
import { DataModel } from '../../types';

export class ListDataModelsQuery implements Query<DataModel[]> {
  private dataModelDataMapper: DataModelDataMapper;

  constructor(private mixerApiService: FdmMixerApiService) {
    this.dataModelDataMapper = new DataModelDataMapper();
  }

  static create(cdfClient: CogniteClient): ListDataModelsQuery {
    const mixerApiService = new FdmMixerApiService(cdfClient);
    return new ListDataModelsQuery(mixerApiService);
  }

  /**
   * Lists the available Data Models
   * @returns
   */
  execute(): Promise<DataModel[]> {
    // mixerApi will return the latest version of all data models (unique data models)
    return this.mixerApiService.listDataModelVersions().then((dataModels) => {
      return dataModels.map((item) =>
        this.dataModelDataMapper.deserialize(item)
      );
    });
  }
}
