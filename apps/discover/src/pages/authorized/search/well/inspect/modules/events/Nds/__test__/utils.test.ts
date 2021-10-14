import { METER } from 'constants/units';

import { getNdsEventTableColumns } from '../utils';

describe('Test NDS utils', () => {
  it('Should return NDS columns customized with unit', async () => {
    const columns = getNdsEventTableColumns(METER);
    expect(columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Header: 'MD Hole Start (m)' }),
        expect.objectContaining({ Header: 'MD Hole End (m)' }),
      ])
    );
  });
});
