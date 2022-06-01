import { mockCogniteEventList } from '__test-utils/fixtures/events';
import { sequence } from '__test-utils/fixtures/log';
import { groupEventsByAssetId } from 'modules/wellSearch/service/event/common';
import { Sequence } from 'modules/wellSearch/types';

import { mapLogType, trimCachedData } from '../common';

describe('Common utils', () => {
  it(`should return trimmed data from query cache`, () => {
    const sequenceData = {
      '1111': [],
      '3333': [],
    };
    const { trimmedData, newIds } = trimCachedData(sequenceData, [
      '1111',
      '2222',
    ]);
    expect(trimmedData).toEqual({
      '1111': [],
    });
    expect(newIds).toEqual(['2222']);
  });

  it(`should map log type to sequence`, () => {
    const mockSequence: Sequence = sequence;
    const sequences = [
      {
        ...mockSequence,
        ...{
          id: '22',
        },
      },
    ];
    const response = mapLogType(sequences, 'geomechanic');
    expect(response[0].logType).toEqual('geomechanic');
  });

  it(`should group events by event ids`, () => {
    const response = groupEventsByAssetId(mockCogniteEventList);

    expect(response).toEqual({
      '12': [mockCogniteEventList[0]],
      '5': [mockCogniteEventList[1]],
    });
  });
});
