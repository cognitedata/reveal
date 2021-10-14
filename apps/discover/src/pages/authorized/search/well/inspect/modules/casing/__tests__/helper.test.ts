import { METER } from 'constants/units';

import { getCasingColumnsWithPrefferedUnit } from '../helper';

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
