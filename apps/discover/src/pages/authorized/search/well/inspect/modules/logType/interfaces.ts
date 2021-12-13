import { Sequence } from '@cognite/sdk';

export type LogTypeData = Sequence & {
  wellName: string;
  wellboreName: string;
  logType: string;
};

export type SequenceLogType = Sequence & { logType?: string };
