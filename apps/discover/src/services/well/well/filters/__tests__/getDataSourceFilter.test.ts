import { getDataSourceFilter } from '../getDataSourceFilter';

describe('getDataSourceFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getDataSourceFilter('')).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getDataSourceFilter(['test'])).toEqual({ sources: ['test'] });
  });
});
