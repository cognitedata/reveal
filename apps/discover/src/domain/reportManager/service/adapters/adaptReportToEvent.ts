import { ExternalEvent } from '@cognite/sdk';

import { DISCOVER_WELL_REPORT } from '../../internal/constants';
import { Report } from '../../internal/types';

export const adaptReportToEvent = (report: Report): ExternalEvent => {
  return {
    description: report.description,
    source: DISCOVER_WELL_REPORT,
    type: report.externalId,
    subtype: report.reportType,
    dataSetId: report.datasetId,
    metadata: {
      reason: report.reason,
      status: report.status,
      ownerUserId: report.ownerUserId,
    },
    startTime: report.startTime,
  };
};
