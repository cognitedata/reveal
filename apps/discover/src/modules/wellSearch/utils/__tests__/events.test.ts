import { Well } from 'domain/wells/well/internal/types';

import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';

import { mockCogniteEvent } from '__test-utils/fixtures/events';
import { mockedWellStateFixture } from '__test-utils/fixtures/well';
import { CogniteEventV3ish } from 'modules/wellSearch/types';

import { getWellbore, mapWellInfo } from '../events';

describe('Events utils', () => {
  it(`should map well informations to events`, () => {
    const events = [{ assetIds: ['1'] }];
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
      events as CogniteEventV3ish[],
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
    expect(resultedWellbore?.id).toEqual('759155409324883');
  });
});
