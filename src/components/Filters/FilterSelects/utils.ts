import { Colors } from '@cognite/cogs.js';
import { PENDING_LABEL, INTERACTIVE_LABEL } from 'hooks/useReviewFiles';
import { MimeType, ReviewStatus, ProgressData } from './types';

export const mimeTypes: MimeType[] = [
  {
    label: 'PDF',
    value: 'application/pdf',
  },
  {
    label: 'JPG',
    value: 'image/jpeg',
  },
  {
    label: 'PNG',
    value: 'image/png',
  },
];

export const progressData: ProgressData[] = [
  {
    type: 'completed',
    label: 'Done',
    color: Colors['green-5'].hex(),
  },
  {
    type: 'running',
    label: 'In progress',
    color: Colors['midblue-4'].hex(),
  },
  {
    type: 'queued',
    label: 'Queued',
    color: Colors['greyscale-grey4'].hex(),
  },
  {
    type: 'failed',
    label: 'Failed',
    color: Colors['red-4'].hex(),
  },
  {
    type: 'idle',
    label: 'Idle',
    color: Colors['greyscale-grey4'].hex(),
  },
];

export const approvalDetails: { [key: string]: ReviewStatus } = {
  pending: {
    status: PENDING_LABEL.externalId,
    type: 'pending',
    variant: 'warning',
    label: 'Pending approval',
  },
  approved: {
    status: INTERACTIVE_LABEL.externalId,
    type: 'approved',
    variant: 'success',
    label: 'Approved',
  },
  unknown: {
    status: 'No tags detected',
    type: 'empty',
    variant: 'unknown',
    label: 'No tags detected',
  },
};
