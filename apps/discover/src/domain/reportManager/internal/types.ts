import { Timestamp, CreatedAndLastUpdatedTime, InternalId } from '@cognite/sdk';

export interface Report
  extends Partial<CreatedAndLastUpdatedTime>,
    Partial<InternalId> {
  description: string;
  reason: string;
  externalId: string;
  reportType: string;
  ownerUserId: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  startTime: Timestamp;
  endTime?: Timestamp;
}

export type ReportFilter = {
  keyword?: string;
  status?: Report['status'][];
  reason?: Report['reason'][];
  reportType?: Report['reportType'][];
  externalIds?: string[];
  ownerUserId?: string[];
};
