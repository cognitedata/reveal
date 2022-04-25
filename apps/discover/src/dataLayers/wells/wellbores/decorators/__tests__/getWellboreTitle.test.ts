// remove when @sdk-wells-v2 is removed:
import { getMockWellbore } from '__test-utils/fixtures/well/wellbore';
import { Wellbore } from 'modules/wellSearch/types';
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
