import { CreatedAndLastUpdatedTime, Sequence } from '@cognite/sdk';

import { SequenceLogType } from 'pages/authorized/search/well/inspect/modules/logType/interfaces';
import { LogData } from 'pages/authorized/search/well/inspect/modules/logType/LogViewer/Log/interfaces';

export const mdValues = [0, 5];
export const mockLogDataMD: LogData = {
  MD: {
    values: mdValues,
    unit: 'ft',
    domain: [15096],
  },
};
export const mockLogDataFRM: LogData = {
  Frm: {
    values: mdValues,
    unit: 'ft',
  },
};

export const mockLogDataTVD: LogData = {
  TVD: {
    values: [[0, 1]],
    unit: 'm',
  },
};

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

export const MockSequenceLogTypeData: SequenceLogType[] = [
  {
    ...sequence,
    ...{
      id: 1,
      logType: 'logType',
      assetId: 11111,
    },
  },
  {
    ...sequence,
    ...{
      id: 1,
      logType: 'ppfg',
      assetId: 11111,
    },
  },
  {
    ...sequence,
    ...{
      id: 1,
      logType: 'geomechanic',
      assetId: 11111,
    },
  },
];
