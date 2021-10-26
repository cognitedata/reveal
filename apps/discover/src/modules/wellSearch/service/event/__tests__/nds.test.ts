import { CogniteEvent } from '@cognite/sdk';

import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';

import { getGroupedNdsEvents } from '../nds';

describe('nds', () => {
  it('should return grouped nds events as expected', () => {
    const response: CogniteEvent[] = [
      {
        id: 1,
        assetIds: [12, 10],
        metadata: { parentExternalId: 'Wellbore A:75915540932499340' },
        ...createdAndLastUpdatedTime,
      },
    ];
    const wellboreIds = [75915540932488339, 75915540932499340];
    const wellboreSourceExternalIdMap = {
      'Wellbore A:75915540932499340': 75915540932499340,
    };
    const groupedEvents = getGroupedNdsEvents(
      response,
      wellboreIds,
      wellboreSourceExternalIdMap
    );

    expect(groupedEvents).toEqual({
      '75915540932488340': [],
      '75915540932499340': [
        {
          id: 1,
          assetIds: [75915540932499340],
          metadata: { parentExternalId: 'Wellbore A:75915540932499340' },
          ...createdAndLastUpdatedTime,
        },
      ],
    });
  });
});
