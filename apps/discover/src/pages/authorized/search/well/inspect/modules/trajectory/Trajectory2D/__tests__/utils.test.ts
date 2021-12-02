import {
  mockedSequencesResultFixture,
  mockedWellboreResultFixture,
  mockedWellStateWithSelectedWells,
} from '__test-utils/fixtures/well';

import {
  getWellboreNameForTrajectory,
  mapSelectedWellbores,
} from '../../utils';

describe('Trajectory2D util', () => {
  it('getWellboreNameForTrajectory', () => {
    const result = getWellboreNameForTrajectory(
      'BBHLH0L1CT-POS7ICp7Al-0007I',
      mockedSequencesResultFixture
    );

    expect(result).toEqual('wellbore a');
  });

  it('mapSelectedWellbores', () => {
    const result = mapSelectedWellbores(
      mockedWellboreResultFixture,
      mockedWellStateWithSelectedWells.wellSearch.selectedWellboreIds
    );

    expect(result).toEqual({
      '759155409324883': true,
      '759155409324993': true,
    });
  });
});
