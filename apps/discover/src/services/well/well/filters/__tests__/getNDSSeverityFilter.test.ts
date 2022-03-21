import { getNDSSeverityFilter } from '../getNDSSeverityFilter';

describe('getNDSSeverityFilter', () => {
  it('should be ok empty', () => {
    expect(getNDSSeverityFilter()).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getNDSSeverityFilter(['test'])).toEqual({
      nds: { exists: true, severities: { containsAny: ['test'] } },
    });
  });

  it('should return empty object with invalid input', () => {
    expect(getNDSSeverityFilter('test')).toEqual({});
  });
});
