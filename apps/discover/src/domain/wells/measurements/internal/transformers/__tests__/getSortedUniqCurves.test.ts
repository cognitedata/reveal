import { getMockWellboreMeasurementsMap } from '__test-utils/fixtures/measurements';

import { getSortedUniqCurves } from '../getSortedUniqCurves';

describe('Measurement filter utils', () => {
  /**
   * getSortedUniqCurves
   */

  test('Should get unique curves', () => {
    expect(getSortedUniqCurves(getMockWellboreMeasurementsMap())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ columnExternalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ columnExternalId: 'PP_COMPOSITE_ML' }),
        expect.objectContaining({ columnExternalId: 'SVERTICAL_PRE' }),
      ])
    );
  });
});
