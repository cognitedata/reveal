import { getMockNPTEvent } from '__test-utils/fixtures/npt';

import { getNptCodeSort } from '../getNptCodeSort';

describe('getNptCodeSort', () => {
  it('should sort ascending', () => {
    expect(
      getNptCodeSort(
        getMockNPTEvent({ nptCode: 'CEMT' }),
        getMockNPTEvent({ nptCode: 'WAIT' })
      )
    ).toBeLessThan(0);
  });

  it('should sort descending', () => {
    expect(
      getNptCodeSort(
        getMockNPTEvent({ nptCode: 'WAIT' }),
        getMockNPTEvent({ nptCode: 'CEMT' })
      )
    ).toBeGreaterThan(0);
  });
});
