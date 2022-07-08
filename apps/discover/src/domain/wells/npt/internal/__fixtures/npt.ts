import { NptInternal } from 'domain/wells/npt/internal/types';

export const getMockNPTEvent = (
  extras?: Partial<NptInternal>
): NptInternal => ({
  wellboreMatchingId: '123456789',
  wellboreAssetExternalId: 'wellbore:USA123456789',
  source: {
    sourceName: 'TEST-SOURCE',
    eventExternalId: 'TEST123',
  },
  startTime: 1096092000000,
  endTime: 1096209000000,
  duration: 1,
  nptCode: 'TEST-NPT-CODE',
  nptCodeColor: '#BFBFBF',
  nptCodeDetail: 'TEST-NPT-CODE-DETAIL',
  ...extras,
});

export const mockNptEvents: NptInternal[] = [
  getMockNPTEvent({
    nptCode: 'CODEA',
    nptCodeDetail: 'DETAILCODEA',
    duration: 0,
    measuredDepth: {
      unit: 'm',
      value: 100,
    },
    wellboreMatchingId: '12',
  }),
  getMockNPTEvent({
    nptCode: 'CODEB',
    nptCodeDetail: 'DETAILCODEB',
    duration: 100,
    measuredDepth: {
      unit: 'm',
      value: 100,
    },
    wellboreMatchingId: '2',
  }),
];
