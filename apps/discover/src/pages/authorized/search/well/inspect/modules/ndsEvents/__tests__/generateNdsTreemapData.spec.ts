import { CogniteEvent } from '@cognite/sdk';

import { getMockNdsEvent } from '__test-utils/fixtures/nds';
import { getMockWellbore } from '__test-utils/fixtures/well/wellbore';
import { mapV3ToV2Wellbore } from 'modules/wellSearch/sdk/utils';
import { WellboreEventsMap } from 'modules/wellSearch/types';

import { generateNdsTreemapData } from '../utils/generateNdsTreemapData';

describe('generateNdsTreemapData', () => {
  it('should generate no data node', () => {
    const result = generateNdsTreemapData([], {});
    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [{ title: 'No data', value: 100 }],
    });
  });

  it('should generate nodes correctly', () => {
    const wellbores = [
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId1', name: 'wellbore 1' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId2', name: 'wellbore 2' })
      ),
    ];

    const ndsEvents: WellboreEventsMap = {
      wellboreId1: [getMockNdsEvent() as unknown as CogniteEvent], // this is temporary until we get rid of the old types -_-
      wellboreId2: [getMockNdsEvent() as unknown as CogniteEvent], // this is temporary until we get rid of the old types -_-
    };

    const result = generateNdsTreemapData(wellbores, ndsEvents);
    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [
        { title: 'wellbore 1', description: '1 events (50%)', value: 1 },
        { title: 'wellbore 2', description: '1 events (50%)', value: 1 },
      ],
    });
  });

  it('should generate nodes and the "other" helper node', () => {
    const wellbores = [
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId1', name: 'wellbore 1' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId2', name: 'wellbore 2' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId3', name: 'wellbore 3' })
      ),
    ];

    const ndsEvents: WellboreEventsMap = {
      // this is temporary until we get rid of the old types -_-
      wellboreId1: [getMockNdsEvent() as unknown as CogniteEvent],
      wellboreId2: [getMockNdsEvent() as unknown as CogniteEvent],
    };

    const result = generateNdsTreemapData(wellbores, ndsEvents);
    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [
        { title: 'wellbore 1', description: '1 events (50%)', value: 1 },
        { title: 'wellbore 2', description: '1 events (50%)', value: 1 },
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
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId1', name: 'wellbore 1' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId2', name: 'wellbore 2' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId3', name: 'wellbore 3' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId4', name: 'wellbore 4' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId5', name: 'wellbore 5' })
      ),
    ];

    const ndsEvents: WellboreEventsMap = {
      // this is temporary until we get rid of the old types -_-
      wellboreId1: [
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
      ],
      wellboreId2: [
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
      ],
      wellboreId4: [getMockNdsEvent() as unknown as CogniteEvent],
      wellboreId5: [
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
        getMockNdsEvent() as unknown as CogniteEvent,
      ],
    };

    const result = generateNdsTreemapData(wellbores, ndsEvents, 3);

    expect(result).toEqual({
      title: 'Wellbore NDS treemap',
      children: [
        { title: 'wellbore 5', description: '5 events (42%)', value: 5 },
        { title: 'wellbore 1', description: '3 events (25%)', value: 3 },
        { title: 'wellbore 2', description: '3 events (25%)', value: 3 },
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
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId1', name: 'wellbore 1' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId2', name: 'wellbore 2' })
      ),
      mapV3ToV2Wellbore(
        getMockWellbore({ matchingId: 'wellboreId3', name: 'wellbore 3' })
      ),
    ];

    const ndsEvents: WellboreEventsMap = {
      // this is temporary until we get rid of the old types -_-
      wellboreId1: [],
      wellboreId2: [],
      wellboreId3: [],
    };

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
