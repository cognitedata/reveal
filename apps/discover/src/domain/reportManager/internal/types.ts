import { Timestamp, CreatedAndLastUpdatedTime, InternalId } from '@cognite/sdk';

export interface Report
  extends Partial<CreatedAndLastUpdatedTime>,
    Partial<InternalId> {
  datasetId: number;
  description: string;
  displayCreatedTime?: string;
  endTime?: Timestamp;
  externalId: string;
  ownerUserId: string;
  reason: 'INCOMPLETE' | 'DUPLICATE' | 'SENSITIVE' | 'OTHER';
  reportType: string;
  startTime: Timestamp;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
}

export type DisplayReport = Omit<Report, 'status' | 'reason'> & {
  reason: string;
  status: string;
};

export type ReportFilter = {
  externalIds?: string[];
  keyword?: string;
  ownerUserId?: string[];
  reason?: Report['reason'][];
  reportType?: Report['reportType'][];
  status?: Report['status'][];
};
