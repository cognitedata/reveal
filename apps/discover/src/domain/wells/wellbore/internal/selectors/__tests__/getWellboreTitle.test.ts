import { WellboreInternal } from 'domain/wells/wellbore/internal/types';
import { getMockWellbore } from 'domain/wells/wellbore/service/__fixtures/wellbore';

import { getWellboreTitle } from '../getWellboreTitle';

describe('getWellboreTitle', () => {
  it('should be add desc and title', () => {
    expect(getWellboreTitle(getMockWellbore() as WellboreInternal)).toEqual(
      'wellbore B desc wellbore B'
    );
  });
  it('should be ok with just title', () => {
    expect(
      getWellboreTitle(getMockWellbore({ description: '' }) as WellboreInternal)
    ).toEqual('wellbore B');
  });
  it('should be ok with just desc', () => {
    expect(
      getWellboreTitle(getMockWellbore({ name: '' }) as WellboreInternal)
    ).toEqual('wellbore B desc');
  });
});
