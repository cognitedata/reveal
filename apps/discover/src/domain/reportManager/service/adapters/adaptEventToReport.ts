import { CogniteEvent } from '@cognite/sdk';

import { Report } from '../../internal/types';

export const adaptEventToReport = (event: CogniteEvent): Report => {
  return {
    createdTime: event.createdTime,
    id: event.id,
    lastUpdatedTime: event.lastUpdatedTime,

    /* report fields */
    datasetId: event.dataSetId!,
    description: event.description!,
    displayCreatedTime: new Date(event.createdTime).toLocaleDateString(),
    endTime: event.endTime,
    externalId: event.type!,
    ownerUserId: event.metadata!.ownerUserId,
    reportType: event.subtype!,
    startTime: event.startTime!,
    // have to cast we get string for CogniteEvent metadat
    reason: event.metadata!.reason as Report['reason'],
    status: event.metadata!.status as Report['status'],
  };
};
