import groupBy from 'lodash/groupBy';

import { CogniteEvent } from '@cognite/sdk';

export const EVENT_PER_PAGE = 1000;

export const groupEventsByAssetId = (events: CogniteEvent[]) => {
  return groupBy(
    events.filter((event) => event.assetIds && event.assetIds?.length),
    'assetIds[0]'
  );
};
