import { ApiStatusCount } from 'modules/contextualization/pnidParsing';

export type MimeType = {
  label: 'PDF' | 'JPG' | 'PNG';
  value: 'application/pdf' | 'image/jpeg' | 'image/png';
};

export type StatusType = keyof ApiStatusCount | 'idle';

export type StatusData = {
  type: StatusType;
  label: string;
  color: string;
};
