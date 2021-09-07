import { LabelVariants } from '@cognite/cogs.js';
import { ApiStatusCount } from 'modules/contextualization/pnidParsing';

export type MimeType = {
  label: 'PDF' | 'JPG' | 'PNG';
  value: 'application/pdf' | 'image/jpeg' | 'image/png';
};

export type ProgressType = keyof ApiStatusCount | 'idle';
export type ProgressData = {
  type: ProgressType;
  label: string;
  color: string;
};

export type StatusType = 'pending' | 'approved' | 'empty';
export type ReviewStatus = {
  status: string;
  type: StatusType;
  variant: LabelVariants;
  label: string;
};
