import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';
import { CogniteEventV3ish } from 'modules/wellSearch/types';

import { getGroupedNdsEvents } from '../nds';

describe('nds', () => {
  it('should return grouped nds events as expected', () => {
    const response: CogniteEventV3ish[] = [
      {
        id: 1,
        assetIds: ['12', '10'],
        metadata: { parentExternalId: 'Wellbore A:759155409324993' },
        ...createdAndLastUpdatedTime,
      },
    ];
    const wellboreIds = ['759155409324883', '759155409324993'];
    const wellboreSourceExternalIdMap = {
      'Wellbore A:759155409324993': '759155409324993',
    };
    const groupedEvents = getGroupedNdsEvents(
      response,
      wellboreIds,
      wellboreSourceExternalIdMap
    );

    expect(groupedEvents).toEqual({
      '759155409324883': [],
      '759155409324993': [
        {
          id: 1,
          assetIds: ['759155409324993'],
          metadata: { parentExternalId: 'Wellbore A:759155409324993' },
          ...createdAndLastUpdatedTime,
        },
      ],
    });
  });
});
