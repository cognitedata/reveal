import groupBy from 'lodash/groupBy';

import { CogniteEventV3ish } from 'modules/wellSearch/types';

export const EVENT_PER_PAGE = 1000;

export const groupEventsByAssetId = (events: CogniteEventV3ish[]) => {
  return groupBy(
    events.filter((event) => event.assetIds && event.assetIds?.length),
    'assetIds[0]'
  );
};
