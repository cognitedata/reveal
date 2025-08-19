import { describe, expect, test } from 'vitest';
import { getUrlRegex } from './getUrlRegex';

describe(getUrlRegex.name, () => {
  test('does not recognize a human language string', () => {
    expect(getUrlRegex().test('hello world')).toBeFalsy();
  });

  test('recognizes https://example.com', () => {
    expect(getUrlRegex().test('https://example.com')).toBeTruthy();
  });

  test('recognizes url with query parameters', () => {
    expect(
      getUrlRegex().test('https://some-site.com/some/subpath?a=parameter&and=another-one')
    ).toBeTruthy();
  });

  test('recognizes URL after human language string', () => {
    expect(getUrlRegex().test('this is a URL: https://example.com')).toBeTruthy();
  });

  test('recognizes URL before human language string', () => {
    expect(getUrlRegex().test('https://example.com was a URL.')).toBeTruthy();
  });
});
