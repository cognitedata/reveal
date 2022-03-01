import { getMockWell } from '__test-utils/fixtures/well/well';

import { getSpudDateSort } from '../getSpudDateSort';

describe('getSpudDateSort', () => {
  it('should be ok', () => {
    expect(
      getSpudDateSort(
        getMockWell({ spudDate: '11.12.1963' }),
        getMockWell({ spudDate: '10.09.2002' })
      )
    ).toEqual(-1230681600000);
  });
  it('should sort descending', () => {
    expect(
      getSpudDateSort(
        getMockWell({ spudDate: '10.09.2002' }),
        getMockWell({ spudDate: '11.12.1963' })
      )
    ).toEqual(1230681600000);
  });
});
