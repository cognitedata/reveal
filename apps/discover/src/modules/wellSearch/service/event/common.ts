import groupBy from 'lodash/groupBy';

import { CogniteEvent } from '@cognite/sdk';

import { EventsType } from 'modules/wellSearch/types';

export const EVENT_LIMIT = 10000;
export const EVENT_PER_PAGE = 1000;

export const getFilterQueryForEvents = (eventType: EventsType) => {
  switch (eventType) {
    case 'nds':
      return {
        source: 'NDS',
        metadata: {
          type: 'Risk',
        },
      };
    case 'npt':
      return {
        source: 'EDM-NPT',
        metadata: {
          type: 'NPT',
        },
      };
    default:
      return {};
  }
};

export const groupEventsByAssetId = (events: CogniteEvent[]) => {
  return groupBy(
    events.filter((event) => event.assetIds && event.assetIds?.length),
    'assetIds[0]'
  );
};
