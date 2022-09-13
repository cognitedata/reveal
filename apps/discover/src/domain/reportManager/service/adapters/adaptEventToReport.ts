import { CogniteEvent } from '@cognite/sdk';

import { Report } from '../../internal/types';

export const adaptEventToReport = (event: CogniteEvent): Report => {
  return {
    id: event.id,
    lastUpdatedTime: event.lastUpdatedTime,
    createdTime: event.createdTime,

    // report fields
    description: event.description!,
    reason: event.metadata!.reason,
    status: event.metadata!.status as Report['status'],
    ownerUserId: event.metadata!.owneruserId,
    externalId: event.type!,
    reportType: event.subtype!,
    startTime: event.startTime!,
    endTime: event.endTime,
    displayCreatedTime: new Date(event.createdTime).toLocaleDateString(),
  };
};
