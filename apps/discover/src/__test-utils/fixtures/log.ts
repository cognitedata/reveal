import { CreatedAndLastUpdatedTime } from '@cognite/sdk';

import { Sequence, SequenceData, SequenceRow } from 'modules/wellSearch/types';

export const mdValues = [0, 5];

export const createdAndLastUpdatedTime: CreatedAndLastUpdatedTime = {
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
};

export const sequence: Sequence = {
  id: 231324234223,
  name: 'Log',
  columns: [
    {
      valueType: 'STRING',
      id: 1,
      name: 'Log',
      metadata: {
        unit: 'ft',
      },
      ...createdAndLastUpdatedTime,
    },
    {
      valueType: 'STRING',
      id: 2,
      name: 'Log',
      metadata: {
        unit: 'm',
      },
      ...createdAndLastUpdatedTime,
    },
  ],
  ...createdAndLastUpdatedTime,
};

export const sequenceData: SequenceData[] = [
  {
    sequence: {
      id: 1,
      metadata: {},
      ...createdAndLastUpdatedTime,
      columns: [
        {
          name: 'FP_COMPOSITE_LOW',
          valueType: 'STRING',
          id: 1,
          ...createdAndLastUpdatedTime,
        },
        {
          name: 'FP_COMPOSITE_ML',
          valueType: 'STRING',
          id: 2,
          ...createdAndLastUpdatedTime,
        },
      ],
    },
  },
];

export const frmLogsData: SequenceData[] = [
  {
    sequence: {
      id: 2,
      columns: [],
      ...createdAndLastUpdatedTime,
    },
    rows: [new SequenceRow(0, [1, 2, 3, 4], [])],
  },
];
