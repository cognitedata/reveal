import { mockedMeasurementsResultFixture } from '__test-utils/fixtures/well';

import { getUniqCurves } from '../measurements/v2/utils';

describe('Measurement utils', () => {
  test('Should return unique measurement curves', () => {
    expect(getUniqCurves(mockedMeasurementsResultFixture)).toEqual([
      'CP_POST',
      'CP_ZERO_PRE',
      'FRICTION_ANGLE_PRE',
      'PP_COMPOSITE_POST',
      'SHMIN_SHALE_ML_PRE',
    ]);
  });
});
