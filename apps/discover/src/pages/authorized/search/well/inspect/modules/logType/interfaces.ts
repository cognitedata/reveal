import { Sequence } from '@cognite/sdk';

import { WellboreId } from 'modules/wellSearch/types';

export type LogTypeData = Sequence & {
  wellName: string;
  wellboreName: string;
  wellboreId: WellboreId;
  logType: string;
};

export type SequenceLogType = Sequence & { logType?: string };
