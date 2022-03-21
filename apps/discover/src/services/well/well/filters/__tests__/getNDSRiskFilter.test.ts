import { getNDSRiskFilter } from '../getNDSRiskFilter';

describe('getNDSRiskFilter', () => {
  it('should be ok empty', () => {
    expect(getNDSRiskFilter()).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getNDSRiskFilter(['test'])).toEqual({
      nds: { exists: true, riskTypes: { containsAny: ['test'] } },
    });
  });

  it('should return empty object with invalid input', () => {
    expect(getNDSRiskFilter('test')).toEqual({});
  });
});
