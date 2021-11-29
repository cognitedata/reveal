import { METER } from 'constants/units';

import { getCasingColumnsWithPrefferedUnit, getScaleBlocks } from '../helper';

describe('getCasingColumnsWithPrefferedUnit', () => {
  it('Should return columns with user preffered unit', async () => {
    const columns = getCasingColumnsWithPrefferedUnit(METER);
    expect(columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'Top MD (m)' }),
        expect.objectContaining({ Header: 'Bottom MD (m)' }),
      ])
    );
  });
});

describe('getScaleBlocks', () => {
  it('Should return scale blocks', async () => {
    const blocks = getScaleBlocks(200, 0, 5000);
    expect(blocks).toEqual([714.29, 1904.76, 3095.24, 4285.71]);
  });
});
