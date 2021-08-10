import { Colors } from '@cognite/cogs.js';
import { MimeType, StatusData } from './types';

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

export const statusData: StatusData[] = [
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
