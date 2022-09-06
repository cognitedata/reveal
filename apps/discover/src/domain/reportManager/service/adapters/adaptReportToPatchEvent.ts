import { EventPatch } from '@cognite/sdk';

import { Report } from '../../internal/types';

export const adaptReportToPatchEvent = (
  _partialReport: Partial<Report>
): EventPatch => {
  const updatedEvent: EventPatch = { update: {} };
  return updatedEvent;
};
