import { getNDSSeverityFilter } from '../getNDSSeverityFilter';

describe('getNDSSeverityFilter', () => {
  it('should be ok empty', () => {
    expect(getNDSSeverityFilter()).toEqual({});
  });
});
