import { EventFilter } from '@cognite/sdk/dist/src';
import isEmpty from 'lodash/isEmpty';
import { InternalEventsFilters } from '../types';

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
