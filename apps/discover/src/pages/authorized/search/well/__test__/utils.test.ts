import { FEET } from 'constants/units';

import { generateWellColumns } from '../utils';

describe('Test utils.ts', () => {
  it('Well column should contain passed unit', async () => {
    const result = generateWellColumns(FEET);
    expect(result.waterDepth.Header).toContain(FEET);
  });
});
