import { getMockRigOperation } from 'domain/wells/rigOperations/service/__fixtures/getMockRigOperation';

import { adaptToWellboreRigNamesMap } from '../adaptToWellboreRigNamesMap';

describe('adaptToWellboreRigNamesMap', () => {
  it('should map rig names to wellbore correctly', () => {
    const rigOperations = [
      getMockRigOperation({
        wellboreMatchingId: 'wellbore-1',
        rigName: 'Rig 1',
      }),
      getMockRigOperation({
        wellboreMatchingId: 'wellbore-2',
        rigName: 'Rig 2',
      }),
      getMockRigOperation({
        wellboreMatchingId: 'wellbore-2',
        rigName: 'Rig 3',
      }),
    ];

    const wellboreRigNamesMap = adaptToWellboreRigNamesMap(rigOperations);

    expect(wellboreRigNamesMap).toEqual({
      'wellbore-1': ['Rig 1'],
      'wellbore-2': ['Rig 2', 'Rig 3'],
    });
  });
});
