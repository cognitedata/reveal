import { CogniteExternalId, CogniteInternalId } from '@cognite/sdk';

import { DateRange, TimeseriesItem } from '../types';

import { createLink } from './utils';

/**
 * https://cognitedata.atlassian.net/wiki/spaces/PI/pages/2867596394/Open+in+Charts+from+other+apps
 */

export interface OpenInChartsQuery {
  timeserieIds?: CogniteInternalId[];
  timeserieExternalIds?: CogniteExternalId[];
  startTime?: string | number | Date;
  endTime?: string | number | Date;
}

export interface Props {
  timeseries: TimeseriesItem[];
  dateRange?: DateRange;
}

export const openInCharts = ({ timeseries, dateRange }: Props) => {
  const query: OpenInChartsQuery = {
    ...getOpenInChartsQueryIds(timeseries),
    startTime: dateRange?.[0].getTime(),
    endTime: dateRange?.[1].getTime(),
  };

  const link = createLink('/charts', query);
  window.open(link, '_blank');
};

export const getOpenInChartsQueryIds = (timeseries: TimeseriesItem[]) => {
  const timeserieIds: CogniteInternalId[] = [];
  const timeserieExternalIds: CogniteExternalId[] = [];

  timeseries.forEach((item) => {
    if ('id' in item) {
      timeserieIds.push(item.id);
    } else {
      timeserieExternalIds.push(item.externalId);
    }
  });

  return {
    timeserieIds,
    timeserieExternalIds,
  };
};
