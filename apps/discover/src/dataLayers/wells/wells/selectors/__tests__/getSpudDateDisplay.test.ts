import { getMockWell } from '__test-utils/fixtures/well/well';

import { getSpudDateDisplay } from '../getSpudDateDisplay';

describe('getSpudDateDisplay', () => {
  it('should be ok without a date', () => {
    expect(getSpudDateDisplay(getMockWell())).toEqual('N/A');
  });
  it('should be ok', () => {
    expect(
      getSpudDateDisplay(getMockWell({ spudDate: '2022-02-28T15:53:07.367Z' }))
    ).toEqual('28.Feb.2022');
  });
});
