import { getNDSProbabilityFilter } from '../getNDSProbabilityFilter';

describe('getNDSProbabilityFilter', () => {
  it('should be ok empty', () => {
    expect(getNDSProbabilityFilter()).toEqual({});
  });
});
