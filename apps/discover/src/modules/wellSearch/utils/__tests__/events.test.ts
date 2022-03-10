import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';

import { CogniteEvent } from '@cognite/sdk';

import { mockCogniteEvent } from '__test-utils/fixtures/events';
import { mockNpt, mockNptEvents } from '__test-utils/fixtures/npt';
import { mockedWellStateFixture } from '__test-utils/fixtures/well';
import { FEET } from 'constants/units';
import {
  UNKNOWN_NPT_CODE,
  UNKNOWN_NPT_DETAIL_CODE,
} from 'modules/wellSearch/constants';
import { Well, WellboreNPTEventsMap } from 'modules/wellSearch/types';

import {
  getWellbore,
  mapWellInfo,
  mapWellInfoToNPTEvents,
  getNPTFilterOptions,
  getFilteredNPTEvents,
} from '../events';

describe('Events utils', () => {
  it(`should map well informations to events`, () => {
    const events = [{ assetIds: [1] }];
    const wells = [
      {
        name: 'Test Well Name',
        wellbores: [
          {
            id: 1,
            description: 'Test Wellbore Name',
          },
        ],
      },
    ];
    const mappedEvents = mapWellInfo(
      events as CogniteEvent[],
      wells as unknown as Well[]
    );
    expect(mappedEvents).toEqual([
      {
        ...events[0],
        metadata: {
          wellName: 'Test Well Name',
          wellboreName: 'Test Wellbore Name',
        },
      },
    ]);
  });

  it(`should get Wellbore`, () => {
    const wellbores = groupBy(
      flatten(
        mockedWellStateFixture.wellSearch.wells.map(
          (well) => well.wellbores || []
        )
      ),
      'id'
    );

    const resultedWellbore = getWellbore(mockCogniteEvent, wellbores);
    expect(resultedWellbore?.id).toEqual(759155409324883);
  });

  it(`should map well informations to npt events`, () => {
    const events: WellboreNPTEventsMap = {
      759155409324993: [mockNpt],
    };

    const results = mapWellInfoToNPTEvents(
      events,
      mockedWellStateFixture.wellSearch.wells,
      FEET
    );
    expect(results).toEqual([
      {
        ...mockNpt,
        ...{
          measuredDepth: undefined,
          nptCode: UNKNOWN_NPT_CODE,
          nptCodeDetail: UNKNOWN_NPT_DETAIL_CODE,
          wellName: '16/1',
          wellboreId: '759155409324993',
          wellboreName: 'wellbore A',
        },
      },
    ]);
  });

  it(`should return unique npt filter options`, () => {
    const results = getNPTFilterOptions(mockNptEvents);
    expect(results).toEqual({
      minMaxDuration: [0, 100],
      nptCodes: ['CODEA', 'CODEB'],
      nptDetailCodes: ['DETAILCODEA', 'DETAILCODEB'],
    });
  });

  it(`should return filtered npt events`, () => {
    const searchPhrase = 'WELL_A';
    const duration = [0, 100];
    const nptCode = ['CODEA'];
    const nptDetailCode = ['DETAILCODEA'];

    const results = getFilteredNPTEvents(mockNptEvents, {
      searchPhrase,
      duration,
      nptCode,
      nptDetailCode,
    });
    expect(results).toEqual([mockNptEvents[0]]);
  });
});
