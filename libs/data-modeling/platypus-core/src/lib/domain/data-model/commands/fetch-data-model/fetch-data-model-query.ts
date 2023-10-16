/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { CogniteClient } from '@cognite/sdk';

import { PlatypusError, Query } from '../../../../boundaries/types';
import { FdmMixerApiService } from '../../providers/fdm-next';
import { DataModelDataMapper } from '../../providers/fdm-next/data-mappers';
import { DataModel } from '../../types';
import { compareDataModelVersions } from '../../utils';

import { FetchDataModelDTO } from './dto';

export class FetchDataModelQuery implements Query<DataModel> {
  private dataModelDataMapper: DataModelDataMapper;

  constructor(private mixerApiService: FdmMixerApiService) {
    this.dataModelDataMapper = new DataModelDataMapper();
  }

  static create(cdfClient: CogniteClient): FetchDataModelQuery {
    const mixerApiService = new FdmMixerApiService(cdfClient);
    return new FetchDataModelQuery(mixerApiService);
  }

  /**
   * Fetch the specified DataModel
   * @param dto FetchDataModelDTO
   * @returns
   */
  execute(dto: FetchDataModelDTO): Promise<DataModel> {
    return this.mixerApiService
      .getDataModelVersionsById(dto.space, dto.dataModelId)
      .then((dataModels) => {
        if (!dataModels.length) {
          return Promise.reject(
            new PlatypusError(
              `Data model with external-id ${dto.dataModelId} does not exist.`,
              'NOT_FOUND',
              404
            )
          );
        }
        return this.dataModelDataMapper.deserialize(
          dataModels.sort(compareDataModelVersions)[0]
        );
      });
  }
}
