import { mockedSequencesResultFixture } from '__test-utils/fixtures/well';

import { getWellboreNameForTrajectory } from '../utils';

describe('Trajectory2D util', () => {
  it('getWellboreNameForTrajectory', () => {
    const result = getWellboreNameForTrajectory(
      'BBHLH0L1CT-POS7ICp7Al-0007I',
      mockedSequencesResultFixture
    );

    expect(result).toEqual('wellbore a');
  });
});
