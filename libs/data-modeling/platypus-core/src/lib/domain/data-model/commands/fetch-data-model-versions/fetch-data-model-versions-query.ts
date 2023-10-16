/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { CogniteClient } from '@cognite/sdk';

import { PlatypusError, Query } from '../../../../boundaries/types';
import { FdmMixerApiService, SpacesApiService } from '../../providers/fdm-next';
import { DataModelVersionDataMapper } from '../../providers/fdm-next/data-mappers';
import { DataModelVersion } from '../../types';
import { compareDataModelVersions } from '../../utils';

import { ListDataModelVersionsDTO } from './dto';

export class FetchDataModelVersionsQuery implements Query<DataModelVersion[]> {
  private dataModelVersionDataMapper: DataModelVersionDataMapper;

  constructor(
    private mixerApiService: FdmMixerApiService,
    private spacesApi: SpacesApiService
  ) {
    this.dataModelVersionDataMapper = new DataModelVersionDataMapper();
  }

  static create(cdfClient: CogniteClient): FetchDataModelVersionsQuery {
    const mixerApiService = new FdmMixerApiService(cdfClient);
    const spacesApi = new SpacesApiService(cdfClient);
    return new FetchDataModelVersionsQuery(mixerApiService, spacesApi);
  }

  /**
   * List Data Model Versions ordered by createdTime, most recent first
   * @param dto
   */
  execute(dto: ListDataModelVersionsDTO): Promise<DataModelVersion[]> {
    return this.mixerApiService
      .getDataModelVersionsById(dto.space!, dto.externalId)
      .then((results) => {
        if (!results || !results.length) {
          return this.spacesApi.getByIds([dto.space!]).then(({ items }) => {
            if (items.length > 0) {
              // space exist, but data model does not
              return Promise.reject(
                new PlatypusError(
                  `Specified data model ${dto.externalId} does not exist!`,
                  'NOT_FOUND'
                )
              );
            } else {
              return Promise.reject(
                new PlatypusError(
                  `Specified space ${dto.space} does not exist!`,
                  'NOT_FOUND'
                )
              );
            }
          });
        }

        return (
          results
            /*
            With DMS V3, a version 1 of a data model is created with an empty schema when
            the data model is created. We hide this from the user so that they don't see
            a v1 "draft" and a v1 "published" when they first create a data model. We
            hide it by filtering out versions with an empty schema, which in effect will
            be version 1. Once the user adds something to the schema, the version will
            no longer be filtered out.
            */
            .filter((result) => !!result.graphQlDml)
            .map((result) =>
              this.dataModelVersionDataMapper.deserialize(result)
            )
            .sort(compareDataModelVersions)
        );
      });
  }
}
