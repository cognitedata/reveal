import {
  createdAndLastUpdatedTime,
  MockSequenceLogTypeData,
} from '__test-utils/fixtures/log';
import {
  SequenceData,
  SequenceRow,
  WellboreData,
} from 'modules/wellSearch/types';

import {
  getLogFrmsTopsIdMapping,
  getPetrelLogIdMapping,
  getPPFGWellboreIdMapping,
} from '../logs';

const sequenceData: SequenceData[] = [
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

const frmLogsData: SequenceData[] = [
  {
    sequence: {
      id: 2,
      columns: [],
      ...createdAndLastUpdatedTime,
    },
    rows: [new SequenceRow(0, [1, 2, 3, 4], [])],
  },
];

const wellboreData: WellboreData = {
  11111: {
    ppfg: sequenceData,
    logType: sequenceData,
    logsFrmTops: frmLogsData,
  },
};

describe('Log viewer utils', () => {
  it('should return ppfg, wellbore id mapping object', () => {
    expect(
      getPPFGWellboreIdMapping(MockSequenceLogTypeData, wellboreData)
    ).toEqual({
      '11111': {
        sequence: {
          ...sequenceData[0].sequence,
          metadata: {
            intersectColCount: '2',
          },
        },
      },
    });
  });

  it('should return petrel logs id mapping object', () => {
    expect(
      getPetrelLogIdMapping(MockSequenceLogTypeData, wellboreData)
    ).toEqual({
      '1': sequenceData[0],
    });
  });

  it('should return formation tops logs id mapping object', () => {
    expect(
      getLogFrmsTopsIdMapping(MockSequenceLogTypeData, wellboreData)
    ).toEqual({
      '11111': frmLogsData[0],
    });
  });
});
