import { getMockWell, getMockWellbore } from '__test-utils/fixtures/well';

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
});
