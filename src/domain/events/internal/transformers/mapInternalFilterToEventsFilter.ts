import { EventFilter } from '@cognite/sdk/dist/src';
import { InternalEventsFilters } from '../types';
import { isEmpty } from 'lodash';

export const mapInternalFilterToEventsFilter = ({
  assetSubtreeIds,
}: InternalEventsFilters): EventFilter | undefined => {
  let filters: EventFilter = {};

  if (assetSubtreeIds && assetSubtreeIds.length > 0) {
    filters = {
      ...filters,
      assetSubtreeIds: assetSubtreeIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  return !isEmpty(filters) ? filters : undefined;
};
