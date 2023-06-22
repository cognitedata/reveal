import { Colors } from '@cognite/cogs.js';

import {
  PENDING_LABEL,
  INTERACTIVE_LABEL,
} from '../../../hooks/useReviewFiles';

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
    color: Colors['decorative--green--500'],
  },
  {
    type: 'running',
    label: 'In progress',
    color: Colors['decorative--blue--400'],
  },
  {
    type: 'queued',
    label: 'Queued',
    color: Colors['decorative--grayscale--400'],
  },
  {
    type: 'failed',
    label: 'Failed',
    color: Colors['decorative--red--400'],
  },
  {
    type: 'idle',
    label: 'Idle',
    color: Colors['decorative--grayscale--400'],
  },
];

export const approvalDetails: { [key: string]: ReviewStatus } = {
  pending: {
    status: PENDING_LABEL.externalId,
    type: 'pending',
    variant: 'warning',
    label: 'Pending approval',
    tooltip: 'New detected tags that need to be reviewed',
  },
  approved: {
    status: INTERACTIVE_LABEL.externalId,
    type: 'approved',
    variant: 'success',
    label: 'Approved',
    tooltip: 'All tags have been reviewed',
  },
  unknown: {
    status: 'No tags detected',
    type: 'empty',
    variant: 'default',
    label: 'No tags detected',
    tooltip: 'No tags were found in the diagram',
  },
};
