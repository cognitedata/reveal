import { getNPTDetailFilter } from '../getNPTDetailFilter';

describe('getNPTDetailFilter', () => {
  it('should be ok empty', () => {
    expect(getNPTDetailFilter()).toEqual({});
  });
});
