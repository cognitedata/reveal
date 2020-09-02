/*!
 * Copyright 2020 Cognite AS
 */
import { isTheSameDomain } from '@/utilities/networking/isTheSameDomain';

describe('isTheSameDomain fn tests', () => {
  const baseOrigin = 'https://foo.bar';

  it('recognizes relative urls as the same domain', () => {
    expect(isTheSameDomain('/relative1', baseOrigin)).toBeTrue();
    expect(isTheSameDomain('relative2', baseOrigin)).toBeTrue();
    expect(isTheSameDomain('relative3/', baseOrigin)).toBeTrue();
    expect(isTheSameDomain('relative4/foo', baseOrigin)).toBeTrue();
    expect(isTheSameDomain('relative5/foo/', baseOrigin)).toBeTrue();
    expect(isTheSameDomain('/relative6/foo', baseOrigin)).toBeTrue();
    expect(isTheSameDomain('/relative7/foo/', baseOrigin)).toBeTrue();
  });

  it('recognizes the same domains if protocol is omitted', () => {
    expect(isTheSameDomain(baseOrigin.replace('https://', ''), baseOrigin)).toBeTrue();
  });

  it('recognizes different domains', () => {
    expect(isTheSameDomain(baseOrigin.replace('bar', 'baz'), baseOrigin)).toBeFalse();
    expect(isTheSameDomain(baseOrigin.replace('foo', 'baz'), baseOrigin)).toBeFalse();
    expect(isTheSameDomain(baseOrigin.replace('foo', 'baz.foo'), baseOrigin)).toBeFalse();
  });

  it('recognizes the same domain in a full url', () => {
    expect(isTheSameDomain(baseOrigin, baseOrigin + '/foo/bar')).toBeTrue();
  });

  it('throws when second arg is a relative url', () => {
    expect(() => isTheSameDomain(baseOrigin, '/foo/bar/')).toThrowError();
    expect(() => isTheSameDomain(baseOrigin, 'foo')).toThrowError();
    expect(() => isTheSameDomain(baseOrigin, '')).toThrowError();
  });
});
