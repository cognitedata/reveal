import { CogniteEvent } from '@cognite/sdk';

import { Report } from '../../internal/types';

export const adaptEventToReport = (event: CogniteEvent): Report => {
  return {
    id: event.id,
    lastUpdatedTime: event.lastUpdatedTime,
    createdTime: event.createdTime,

    /* report fields */
    description: event.description!,
    ownerUserId: event.metadata!.ownerUserId,
    externalId: event.type!,
    reportType: event.subtype!,
    startTime: event.startTime!,
    endTime: event.endTime,
    displayCreatedTime: new Date(event.createdTime).toLocaleDateString(),
    // have to cast we get string for CogniteEvent metadat
    reason: event.metadata!.reason as Report['reason'],
    status: event.metadata!.status as Report['status'],
  };
};
