import { useCallback, useMemo } from 'react';

import keyBy from 'lodash/keyBy';

import { CogniteExternalId, CogniteInternalId } from '@cognite/sdk';

import { TimeseriesItem } from '../../../types';

interface CallbackProps {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
}

export const useTimeseriesColor = (timeseries: TimeseriesItem[]) => {
  const timeseriesById = useMemo(() => {
    return keyBy(timeseries, 'id');
  }, [timeseries]);

  const timeseriesByExternalId = useMemo(() => {
    return keyBy(timeseries, 'externalId');
  }, [timeseries]);

  return useCallback(
    ({ id, externalId }: CallbackProps) => {
      const timeseriesItem = timeseriesById[id];

      if (timeseriesItem) {
        return timeseriesItem.color;
      }

      if (externalId) {
        return timeseriesByExternalId[externalId]?.color;
      }

      return undefined;
    },
    [timeseriesByExternalId, timeseriesById]
  );
};
