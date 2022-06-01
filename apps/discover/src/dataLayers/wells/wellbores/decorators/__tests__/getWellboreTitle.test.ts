// remove when @sdk-wells-v2 is removed:
import { Wellbore } from 'domain/wells/wellbore/internal/types';
import { getMockWellbore } from 'domain/wells/wellbore/service/__fixtures/wellbore';
// add when @sdk-wells-v2 is removed:
// import { Wellbore } from '@cognite/sdk-wells-v3';

import { getWellboreTitle } from '../getWellboreTitle';

describe('getWellboreTitle', () => {
  it('should be add desc and title', () => {
    expect(getWellboreTitle(getMockWellbore() as Wellbore)).toEqual(
      'wellbore B desc wellbore B'
    );
  });
  it('should be ok with just title', () => {
    expect(
      getWellboreTitle(getMockWellbore({ description: '' }) as Wellbore)
    ).toEqual('wellbore B');
  });
  it('should be ok with just desc', () => {
    expect(getWellboreTitle(getMockWellbore({ name: '' }) as Wellbore)).toEqual(
      'wellbore B desc'
    );
  });
});
