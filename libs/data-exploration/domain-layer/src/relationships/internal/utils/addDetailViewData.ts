import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';

import { CogniteExternalId } from '@cognite/sdk';

import { DetailViewRelatedResourcesData, WithDetailViewData } from '../types';

export const addDetailViewData = <T extends { externalId?: CogniteExternalId }>(
  data: T[],
  detailViewData: DetailViewRelatedResourcesData[]
): WithDetailViewData<T>[] => {
  const keyedDetailViewData = keyBy(detailViewData, 'externalId');

  return compact(
    data.map((dataProps) => {
      const { externalId } = dataProps;

      if (!externalId) {
        return null;
      }

      return {
        ...dataProps,
        ...keyedDetailViewData[externalId],
      };
    })
  );
};
