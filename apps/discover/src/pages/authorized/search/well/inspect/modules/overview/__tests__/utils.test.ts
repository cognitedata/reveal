import { FEET } from 'constants/units';

import { generateOverviewColumns } from '../utils';

describe('Test utils.ts', () => {
  it('Overview column should contain passed unit', async () => {
    const columns = generateOverviewColumns(FEET);
    expect(
      columns.filter((column) => column.accessor === 'waterDepth.value')[0]
        .Header
    ).toContain(FEET);
    expect(
      columns.filter((column) => String(column.Header).includes('TVD'))[0]
        .Header
    ).toContain(FEET);
    expect(
      columns.filter((column) => String(column.Header).includes('MD'))[0].Header
    ).toContain(FEET);
  });
});
