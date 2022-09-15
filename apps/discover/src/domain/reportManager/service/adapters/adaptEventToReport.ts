import { CogniteEvent } from '@cognite/sdk';

import {
  DATA_SETS_MAP,
  DATA_SET_FEEDBACK_TYPES,
} from '../../internal/constants';
import { Report } from '../../internal/types';

export const adaptEventToReport = (event: CogniteEvent): Report => {
  return {
    id: event.id,
    lastUpdatedTime: event.lastUpdatedTime,
    createdTime: event.createdTime,

    // report fields
    description: event.description!,
    reason: DATA_SET_FEEDBACK_TYPES[event.metadata!.reason],
    status: event.metadata!.status as Report['status'],
    ownerUserId: event.metadata!.ownerUserId,
    externalId: event.type!,
    reportType: DATA_SETS_MAP[event.subtype!],
    startTime: event.startTime!,
    endTime: event.endTime,
    displayCreatedTime: new Date(event.createdTime).toLocaleDateString(),
  };
};
