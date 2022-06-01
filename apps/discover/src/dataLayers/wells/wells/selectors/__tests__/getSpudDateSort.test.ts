import { getMockWell } from 'domain/wells/well/service/__fixtures/well';

import { getSpudDateSort } from '../getSpudDateSort';

describe('getSpudDateSort', () => {
  it('should be ok', () => {
    expect(
      getSpudDateSort(
        getMockWell({ spudDate: '11-Dec-1963' }),
        getMockWell({ spudDate: '10-Sep-2002' })
      )
    ).toBeLessThan(0);
  });
  it('should sort descending', () => {
    expect(
      getSpudDateSort(
        getMockWell({ spudDate: '10-Sep-2002' }),
        getMockWell({ spudDate: '11-Dec-1963' })
      )
    ).toBeGreaterThan(0);
  });
});
