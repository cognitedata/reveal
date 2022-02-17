import { FEET } from 'constants/units';

import { getWellColumns } from '../getWellColumns';

describe('getWellColumns', () => {
  it('Well column should contain passed unit', async () => {
    const result = getWellColumns(FEET);
    expect(result.waterDepth.Header).toContain(FEET);
  });
});
