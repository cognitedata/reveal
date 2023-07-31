import { getNPTDetailFilter } from '../getNPTDetailFilter';

describe('getNPTDetailFilter', () => {
  it('should be ok empty', () => {
    expect(getNPTDetailFilter()).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getNPTDetailFilter(['test'])).toEqual({
      npt: { exists: true, nptCodeDetails: { containsAll: ['test'] } },
    });
  });

  it('should return empty object with invalid input', () => {
    expect(getNPTDetailFilter('test')).toEqual({});
  });
});
