import { getNDSProbabilityFilter } from '../getNDSProbabilityFilter';

describe('getNDSProbabilityFilter', () => {
  it('should be ok empty', () => {
    expect(getNDSProbabilityFilter()).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getNDSProbabilityFilter(['test'])).toEqual({
      nds: { exists: true, probabilities: { containsAny: ['test'] } },
    });
  });

  it('should return empty object with invalid input', () => {
    expect(getNDSProbabilityFilter('test')).toEqual({});
  });
});
