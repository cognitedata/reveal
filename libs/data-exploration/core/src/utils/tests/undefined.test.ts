import { isNotUndefined } from '../undefined';

describe('isNotUndefined', () => {
  it('should return corrct results', () => {
    const obj: Record<string, string> = { test: 'example' };
    expect(isNotUndefined(obj['x'])).toBeFalsy();
    expect(isNotUndefined(obj['test'])).toBeTruthy();
    expect(isNotUndefined(undefined)).toBeFalsy();
    expect(isNotUndefined({})).toBeTruthy();
  });
});
