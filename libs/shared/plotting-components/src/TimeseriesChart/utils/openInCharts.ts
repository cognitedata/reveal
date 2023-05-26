import { createLink } from '@cognite/cdf-utilities';

import { DateRange } from '../types';

/**
 * https://cognitedata.atlassian.net/wiki/spaces/PI/pages/2867596394/Open+in+Charts+from+other+apps
 */

export interface OpenInChartsQuery {
  timeserieIds: number[];
  startTime?: string | number | Date;
  endTime?: string | number | Date;
}

export interface Props {
  timeseriesId: number;
  dateRange?: DateRange;
}

export const openInCharts = ({ timeseriesId, dateRange }: Props) => {
  const query: OpenInChartsQuery = {
    timeserieIds: [timeseriesId],
    startTime: dateRange?.[0].getTime(),
    endTime: dateRange?.[1].getTime(),
  };

  const link = createLink('/charts', query);
  window.open(link, '_blank');
};
