import { EventPatch } from '@cognite/sdk';

import { Report } from '../../internal/types';

export const adaptReportToPatchEvent = (
  partialReport: Partial<Report>
): EventPatch => {
  const updatedEvent: EventPatch['update'] = {};
  if (partialReport.endTime) {
    updatedEvent.endTime = { set: partialReport.endTime };
  }
  if (partialReport.status) {
    updatedEvent.metadata = {
      add: {
        status: partialReport.status,
      },
      remove: [],
    };
  }

  return { update: updatedEvent };
};
