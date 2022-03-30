import { getMockWell, getMockWellbore } from '__test-utils/fixtures/well';
import { FavoriteContentWells } from 'modules/favorite/types';
import { Well } from 'modules/wellSearch/types';

import {
  filterWellboresFromWellsData,
  getIndeterminateWellIds,
  getSelectedWellIds,
  getUpdatedWellsAndWellboresAfterRemove,
  setSelectedWellboreIdsToWell,
} from '../utils';

describe('Favorite utils', () => {
  it('filterWellboresFromWellsData', () => {
    const wells: Well[] = [
      getMockWell({
        id: '1',
        wellbores: [
          getMockWellbore({ id: '1' }),
          getMockWellbore({ id: '2' }),
          getMockWellbore({ id: '3' }),
        ],
      }),
      getMockWell({
        id: '2',
        wellbores: [
          getMockWellbore({ id: '4' }),
          getMockWellbore({ id: '5' }),
          getMockWellbore({ id: '6' }),
        ],
      }),
      getMockWell({
        id: '3',
        wellbores: [
          getMockWellbore({ id: '7' }),
          getMockWellbore({ id: '8' }),
          getMockWellbore({ id: '9' }),
        ],
      }),
    ];

    const favoriteWells: FavoriteContentWells = {
      1: ['1'],
      2: ['5', '6'],
      3: [],
    };

    const result = filterWellboresFromWellsData(wells, favoriteWells);

    // first well should have only one wellbore with id '1'
    expect(result[0].wellbores).toHaveLength(1);
    expect(result[0].wellbores?.map((wellbore) => wellbore.id)).toEqual(['1']);

    // second well should have 2 wellbores with ids '5', '6'
    expect(result[1].wellbores).toHaveLength(2);
    expect(result[1].wellbores?.map((wellbore) => wellbore.id)).toEqual([
      '5',
      '6',
    ]);

    // third well should have all wellbores since the favoriteWells is [] means include all
    expect(result[2].wellbores).toHaveLength(3);
    expect(result[2].wellbores?.map((wellbore) => wellbore.id)).toEqual([
      '7',
      '8',
      '9',
    ]);
  });

  it('setSelectedWellboreIdsToWell', () => {
    expect(setSelectedWellboreIdsToWell({}, 'wellId1', 'wellboreId1')).toEqual({
      wellId1: ['wellboreId1'],
    });
    expect(
      setSelectedWellboreIdsToWell(
        { wellId1: ['wellboreId1', 'wellboreId2'] },
        'wellId2',
        'wellboreId3'
      )
    ).toEqual({
      wellId1: ['wellboreId1', 'wellboreId2'],
      wellId2: ['wellboreId3'],
    });

    expect(
      setSelectedWellboreIdsToWell(
        {
          wellId1: ['wellboreId1', 'wellboreId2'],
          wellId2: ['wellboreId3'],
        },
        'wellId1',
        'wellboreId2'
      )
    ).toEqual({
      wellId1: ['wellboreId1'],
      wellId2: ['wellboreId3'],
    });
  });

  it('getSelectedWellIds', () => {
    const wells = [
      getMockWell({
        id: '1',
        wellbores: [
          getMockWellbore({ id: '1' }),
          getMockWellbore({ id: '2' }),
          getMockWellbore({ id: '3' }),
        ],
      }),
      getMockWell({
        id: '2',
        wellbores: [getMockWellbore({ id: '4' }), getMockWellbore({ id: '5' })],
      }),
    ];

    expect(getSelectedWellIds(wells, {})).toEqual({});
    expect(getSelectedWellIds(wells, { '1': [], '2': [], '3': [] })).toEqual({
      '1': false,
      '2': false,
    });
    expect(
      getSelectedWellIds(wells, { '1': ['1', '2', '3'], '2': ['4'] })
    ).toEqual({
      '1': true,
      '2': true,
    });
  });

  it('getIndeterminateWellIds', () => {
    const wells = [
      getMockWell({
        id: '1',
        wellbores: [
          getMockWellbore({ id: '1' }),
          getMockWellbore({ id: '2' }),
          getMockWellbore({ id: '3' }),
        ],
      }),
      getMockWell({
        id: '2',
        wellbores: [getMockWellbore({ id: '4' }), getMockWellbore({ id: '5' })],
      }),
    ];

    expect(getIndeterminateWellIds(wells, {})).toEqual({});
    expect(
      getIndeterminateWellIds(wells, { '1': [], '2': [], '3': [] })
    ).toEqual({
      '1': false,
      '2': false,
    });
    expect(
      getIndeterminateWellIds(wells, { '1': ['1', '2', '3'], '2': ['4'] })
    ).toEqual({
      '1': false,
      '2': true,
    });
  });

  describe('getUpdatedWellsAndWellboresAfterRemove', () => {
    it('should not update favoriteWells if nothing is selected', () => {
      const wells = [getMockWell({ id: '1' }), getMockWell({ id: '2' })];
      const favoriteWells: FavoriteContentWells = {
        1: [],
        2: ['4'],
      };
      const selectedWellsAndWellbores = {
        2: [],
      };

      const result = getUpdatedWellsAndWellboresAfterRemove(
        wells,
        favoriteWells,
        selectedWellsAndWellbores
      );

      expect(result).toEqual(favoriteWells);
    });

    it('should also remove well if all wellbores are removed', () => {
      const wells = [
        getMockWell({
          id: '1',
          wellbores: [
            getMockWellbore({ id: 'wellbore1' }),
            getMockWellbore({ id: 'wellbore2' }),
          ],
        }),
        getMockWell({
          id: '2',
          wellbores: [
            getMockWellbore({ id: 'wellbore3' }),
            getMockWellbore({ id: 'wellbore4' }),
          ],
        }),
      ];
      const favoriteWells: FavoriteContentWells = {
        1: ['wellbore1', 'wellbore2'],
        2: [],
      };
      const selectedWellsAndWellbores = {
        1: ['wellbore1', 'wellbore2'],
        2: ['wellbore3', 'wellbore4'],
      };

      const result = getUpdatedWellsAndWellboresAfterRemove(
        wells,
        favoriteWells,
        selectedWellsAndWellbores
      );

      expect(result).toEqual({});
    });

    it('should remove selected wellbores accordingly', () => {
      const wells = [
        getMockWell({
          id: '1',
          wellbores: [
            getMockWellbore({ id: 'wellbore1' }),
            getMockWellbore({ id: 'wellbore2' }),
          ],
        }),
        getMockWell({
          id: '2',
          wellbores: [
            getMockWellbore({ id: 'wellbore3' }),
            getMockWellbore({ id: 'wellbore4' }),
          ],
        }),
      ];
      const favoriteWells: FavoriteContentWells = {
        1: ['wellbore1', 'wellbore2'],
        2: [],
      };
      const selectedWellsAndWellbores = {
        1: ['wellbore2'],
        2: ['wellbore3'],
      };

      const result = getUpdatedWellsAndWellboresAfterRemove(
        wells,
        favoriteWells,
        selectedWellsAndWellbores
      );

      expect(result).toEqual({
        1: ['wellbore1'],
        2: ['wellbore4'],
      });
    });
  });
});
