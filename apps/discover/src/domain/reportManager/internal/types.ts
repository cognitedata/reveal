import { Timestamp, CreatedAndLastUpdatedTime, InternalId } from '@cognite/sdk';

export interface Report
  extends Partial<CreatedAndLastUpdatedTime>,
    Partial<InternalId> {
  description: string;
  reason: 'INCOMPLETE' | 'DUPLICATE' | 'SENSITIVE' | 'OTHER';
  externalId: string;
  reportType: string;
  ownerUserId: string;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  startTime: Timestamp;
  endTime?: Timestamp;
  displayCreatedTime?: string;
}

export type DisplayReport = Omit<Report, 'status' | 'reason'> & {
  reason: string;
  status: string;
};

export type ReportFilter = {
  keyword?: string;
  status?: Report['status'][];
  reason?: Report['reason'][];
  reportType?: Report['reportType'][];
  externalIds?: string[];
  ownerUserId?: string[];
};
