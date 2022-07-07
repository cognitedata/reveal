import { isParentShouldUpdate } from '../isParentShouldUpdate';

describe('isParentShouldUpdate', () => {
  it('should return expected result with valid input', () => {
    expect(isParentShouldUpdate('', [])).toBeTruthy();
  });

  it('should return expected result with inputs', () => {
    expect(isParentShouldUpdate(['test', 'test1'], ['test'])).toEqual(false);
  });

  it('should return expected result', () => {
    expect(isParentShouldUpdate(['test', 'test1'], ['test2'])).toEqual(true);
  });
});
