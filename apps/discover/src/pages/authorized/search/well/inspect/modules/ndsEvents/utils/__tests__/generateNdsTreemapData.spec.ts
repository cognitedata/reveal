import { NdsDataLayer } from 'domain/wells/dataLayer/nds/types';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { getMockNdsEvent } from '__test-utils/fixtures/nds';

import { generateNdsTreemapData } from '../generateNdsTreemapData';

describe('generateNdsTreemapData', () => {
  it('should generate no data node', () => {
    const result = generateNdsTreemapData([], []);
    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [{ title: 'No data', value: 100 }],
    });
  });

  it('should generate nodes correctly', () => {
    const wellbores = [
      getMockWellbore({ id: 'wellboreId1', name: 'wellbore 1' }),
      getMockWellbore({ id: 'wellboreId2', name: 'wellbore 2' }),
    ];

    const ndsEvents = [
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId1' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId2' }),
    ] as NdsDataLayer[];

    const result = generateNdsTreemapData(wellbores, ndsEvents);
    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [
        {
          title: 'wellbore 1',
          description: '1 events (50%)',
          value: 1,
          ndsEvents: [ndsEvents[0]],
        },
        {
          title: 'wellbore 2',
          description: '1 events (50%)',
          value: 1,
          ndsEvents: [ndsEvents[1]],
        },
      ],
    });
  });

  it('should generate nodes and the "other" helper node', () => {
    const wellbores = [
      getMockWellbore({ id: 'wellboreId1', name: 'wellbore 1' }),

      getMockWellbore({ id: 'wellboreId2', name: 'wellbore 2' }),

      getMockWellbore({ id: 'wellboreId3', name: 'wellbore 3' }),
    ];

    const ndsEvents = [
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId1' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId2' }),
    ] as NdsDataLayer[];

    const result = generateNdsTreemapData(wellbores, ndsEvents);
    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [
        {
          title: 'wellbore 1',
          description: '1 events (50%)',
          value: 1,
          ndsEvents: [ndsEvents[0]],
        },
        {
          title: 'wellbore 2',
          description: '1 events (50%)',
          value: 1,
          ndsEvents: [ndsEvents[1]],
        },
        {
          title: 'Other (1)',
          description: '0 events (0%)',
          value: 1,
          id: 'other',
          wellbores: [
            { id: 'wellboreId3', name: 'wellbore 3', numberOfEvents: 0 },
          ],
        },
      ],
    });
  });

  it('should generate "other" node if the number of nodes is to high', () => {
    const wellbores = [
      getMockWellbore({ id: 'wellboreId1', name: 'wellbore 1' }),

      getMockWellbore({ id: 'wellboreId2', name: 'wellbore 2' }),

      getMockWellbore({ id: 'wellboreId3', name: 'wellbore 3' }),

      getMockWellbore({ id: 'wellboreId4', name: 'wellbore 4' }),

      getMockWellbore({ id: 'wellboreId5', name: 'wellbore 5' }),
    ];

    const wellbore1Nds = [
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId1' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId1' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId1' }),
    ];
    const wellbore2Nds = [
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId2' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId2' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId2' }),
    ];
    const wellbore4Nds = [
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId4' }),
    ];
    const wellbore5Nds = [
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId5' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId5' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId5' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId5' }),
      getMockNdsEvent({ wellboreMatchingId: 'wellboreId5' }),
    ];

    const ndsEvents = [
      ...wellbore1Nds,
      ...wellbore2Nds,
      ...wellbore4Nds,
      ...wellbore5Nds,
    ] as NdsDataLayer[];

    const result = generateNdsTreemapData(wellbores, ndsEvents, 3);

    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [
        {
          title: 'wellbore 5',
          description: '5 events (42%)',
          value: 5,
          ndsEvents: wellbore5Nds,
        },
        {
          title: 'wellbore 1',
          description: '3 events (25%)',
          value: 3,
          ndsEvents: wellbore1Nds,
        },
        {
          title: 'wellbore 2',
          description: '3 events (25%)',
          value: 3,
          ndsEvents: wellbore2Nds,
        },
        {
          title: 'Other (2)',
          description: '1 events (8%)',
          value: 3,
          id: 'other',
          wellbores: [
            { id: 'wellboreId4', name: 'wellbore 4', numberOfEvents: 1 },
            { id: 'wellboreId3', name: 'wellbore 3', numberOfEvents: 0 },
          ],
        },
      ],
    });
  });

  it('should generate only the other node if there is data but no events', () => {
    const wellbores = [
      getMockWellbore({ id: 'wellboreId1', name: 'wellbore 1' }),

      getMockWellbore({ id: 'wellboreId2', name: 'wellbore 2' }),

      getMockWellbore({ id: 'wellboreId3', name: 'wellbore 3' }),
    ];

    const ndsEvents: NdsDataLayer[] = [];

    const result = generateNdsTreemapData(wellbores, ndsEvents);
    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [
        {
          id: 'other',
          title: 'Other (3)',
          value: 100,
          description: '0 events (0%)',
          wellbores: [
            { id: 'wellboreId1', name: 'wellbore 1', numberOfEvents: 0 },
            { id: 'wellboreId2', name: 'wellbore 2', numberOfEvents: 0 },
            { id: 'wellboreId3', name: 'wellbore 3', numberOfEvents: 0 },
          ],
        },
      ],
    });
  });
});
