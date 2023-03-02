import { isValidUrl } from '../url';

describe('url', () => {
  describe('isValidUrl', () => {
    test.each([
      ['http://foo.com/blah_blah', true],
      ['http://foo.com/blah_blah/', true],
      ['http://foo.com/blah_blah_(wikipedia)_(again)', true],
      ['https://www.example.com/foo/?bar=baz&inga=42&quux', true],
      ['http://userid:password@example.com:8080', true],
      ['http://userid@example.com:8080/', true],
      ['http://142.42.1.1/', true],
      ['http://142.42.1.1:8080/', true],
      ['http://foo.com/unicode_(✪)_in_parens', true],
      ['ftp://foo.bar/baz', true],
      ['http://', false],
      ['http://foo.bar?q=Spaces should be encoded', false],
      ['//', false],
      ['//a', false],
      ['///', false],
      ['http:///a', false],
      ['foo.com', false],
      ['rdar://1234', false],
      ['h://test', false],
      ['http:// shouldfail.com', false],
      [':// should fail', false],
      ['Trends: Periodic abnormal values', false],
      ['trends: Periodic abnormal values', false],
      ['random: Periodic abnormal values', false],
      ['random; Periodic abnormal values', false],
      ['HTTP: Periodic abnormal values', false],
      ['http: Periodic abnormal values', false],
    ])('isValidUrl(%s)', (value, expected) => {
      const result = isValidUrl(value);
      expect(result).toBe(expected);
    });
  });
});
