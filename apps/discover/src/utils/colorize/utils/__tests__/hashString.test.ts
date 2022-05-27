import { hashString } from '../hashString';

describe('getStringASCIIValue', () => {
  it('should return the ASCII value for string', () => {
    expect(hashString('')).toEqual(0);
    expect(hashString(' ')).toEqual(0);
    expect(hashString('TEST_STRING_UPPERCASE')).toEqual(17855);
    expect(hashString('test_string_lowercase')).toEqual(24677);
  });

  it('should not collide same string with different order of characters', () => {
    expect(hashString('ABCD')).not.toEqual(hashString('ACBD'));
  });
});
