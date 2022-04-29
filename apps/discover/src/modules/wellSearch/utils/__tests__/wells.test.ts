import { getMockWell, getMockWellbore } from '__test-utils/fixtures/well';

import { isWellboreFavored } from '../isWellboreFavored';
import {
  getIndeterminateWells,
  getWellsOfWellIds,
  normalizeWell,
} from '../wells';

describe('Well utils', () => {
  it('should normalize wells as expected', () => {
    expect(normalizeWell(getMockWell())).toEqual({
      description: 'test-well-desc',
      id: 1234,
      name: 'test-well',
      sourceAssets: expect.any(Function),
      spudDate: new Date('2021-05-28T08:32:32.316Z'),
      waterDepth: {
        unit: 'ft',
        value: 23.523422,
      },
      wellbores: undefined,
    });
  });

  it('should return indeterminate wells', () => {
    const wells = [
      getMockWell({
        id: 'well1',
        wellbores: [
          getMockWellbore({ id: 'well1/wellbore1' }),
          getMockWellbore({ id: 'well1/wellbore2' }),
          getMockWellbore({ id: 'well1/wellbore3' }),
        ],
      }),
      getMockWell({
        id: 'well2',
        wellbores: [
          getMockWellbore({ id: 'well2/wellbore1' }),
          getMockWellbore({ id: 'well2/wellbore2' }),
        ],
      }),
    ];

    const selectedWellboreIds = {
      'well1/wellbore1': true,
      'well2/wellbore1': true,
      'well2/wellbore2': true,
    };

    expect(getIndeterminateWells(wells, selectedWellboreIds)).toEqual({
      well1: true,
    });
  });

  it('should return required wells only', () => {
    const requiredWell = getMockWell({ id: 'requiredWellId' });
    const wells = [requiredWell, getMockWell()];

    expect(getWellsOfWellIds(wells, ['requiredWellId'])).toEqual([
      requiredWell,
    ]);
  });

  it('should return false with empty favorite well id list', () => {
    expect(isWellboreFavored({}, 'well_id', 'wellbore_id')).toBeFalsy();
  });

  it('should return false when the well id not in the favorite list', () => {
    expect(
      isWellboreFavored(
        { well_id: ['wellbore_id'], well_Id_2: [] },
        'well_id_3',
        'wellbore_id'
      )
    ).toBeFalsy();
  });

  it('should return false when wellbore id not in favorite', () => {
    expect(
      isWellboreFavored(
        { well_id: ['wellbore_id'] },
        'well_id',
        'wellbore_id_2'
      )
    ).toBeFalsy();
  });

  it('should return true with valid input', () => {
    expect(
      isWellboreFavored(
        {
          well_id: ['wellbore_id'],
          well_Id_2: ['wellbore_id_2'],
        },
        'well_id',
        'wellbore_id'
      )
    ).toBeTruthy();
  });

  it('should return true when corresponding wellbore array is empty', () => {
    expect(
      isWellboreFavored({ well_id: [] }, 'well_id', 'wellbore_id_2')
    ).toBeTruthy();
  });
});
