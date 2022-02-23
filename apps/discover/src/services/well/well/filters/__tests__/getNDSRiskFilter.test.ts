import { getNDSRiskFilter } from '../getNDSRiskFilter';

describe('getNDSRiskFilter', () => {
  it('should be ok empty', () => {
    expect(getNDSRiskFilter()).toEqual({});
  });
});
