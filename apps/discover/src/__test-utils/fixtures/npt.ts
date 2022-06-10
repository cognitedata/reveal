import { NPT } from '@cognite/sdk-wells-v2';

import { NPTEvent } from 'modules/wellSearch/types';

// TODO(PP-2998): Remove well sdk v2 usage in NPT
export const mockNpt: NPT = {
  duration: 0,
  endTime: 0,
  parentExternalId: '1',
  parentType: '',
  source: '',
  sourceEventExternalId: '',
  startTime: 0,
};

export const getMockNPTEvent = (extras?: Partial<NPTEvent>): NPTEvent => ({
  parentExternalId: 'wellbore:USA123456789',
  parentType: 'Wellbore',
  sourceEventExternalId: 'TEST123',
  source: 'TEST-SOURCE',
  startTime: 1096092000000,
  endTime: 1096209000000,
  duration: 1,
  wellboreId: '123456789',
  nptCode: 'TEST-NPT-CODE',
  nptCodeColor: '#BFBFBF',
  ...extras,
});

export const mockNptEvents: NPTEvent[] = [
  getMockNPTEvent({
    wellName: 'WELL_A',
    nptCode: 'CODEA',
    nptCodeDetail: 'DETAILCODEA',
    duration: 0,
    measuredDepth: {
      unit: 'meter',
      value: 100,
    },
    wellboreId: '12',
  }),
  getMockNPTEvent({
    wellName: 'WELL_B',
    nptCode: 'CODEB',
    nptCodeDetail: 'DETAILCODEB',
    duration: 100,
    measuredDepth: {
      unit: 'meter',
      value: 100,
    },
    wellboreId: '2',
  }),
];
