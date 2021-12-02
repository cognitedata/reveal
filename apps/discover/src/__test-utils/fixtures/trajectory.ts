import { SequenceColumn } from '@cognite/sdk';

import { TrajectoryRows } from 'modules/wellSearch/types';

import { createdAndLastUpdatedTime } from './log';

export const mockedTrajectoryData: TrajectoryRows[] = [
  {
    id: 1,
    externalId: '0',
    columns: [{ name: 'Depth', valueType: 'string', externalId: '0' }],
    rows: [{ rowNumber: 0, values: [0, 1] }],
    wellboreId: 759155409324883,
  },
];

export const getMockSequenceData: (
  extras?: Partial<SequenceColumn>
) => SequenceColumn = (extras = {}) => {
  return {
    name: 'Depth',
    valueType: 'STRING',
    id: 1,
    ...createdAndLastUpdatedTime,
    ...extras,
  };
};
