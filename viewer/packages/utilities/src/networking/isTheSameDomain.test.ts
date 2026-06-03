/*!
 * Copyright 2021 Cognite AS
 */
import { isTheSameDomain } from './isTheSameDomain';

describe('isTheSameDomain fn tests', () => {
  const baseOrigin = 'https://foo.bar';

  it('recognizes relative urls as the same domain', () => {
    expect(isTheSameDomain('/relative1', baseOrigin)).toBeTruthy();
    expect(isTheSameDomain('relative2', baseOrigin)).toBeTruthy();
    expect(isTheSameDomain('relative3/', baseOrigin)).toBeTruthy();
    expect(isTheSameDomain('relative4/foo', baseOrigin)).toBeTruthy();
    expect(isTheSameDomain('relative5/foo/', baseOrigin)).toBeTruthy();
    expect(isTheSameDomain('/relative6/foo', baseOrigin)).toBeTruthy();
    expect(isTheSameDomain('/relative7/foo/', baseOrigin)).toBeTruthy();
  });

  it('works fine for any protocol of base origin', () => {
    const domainName = 'foo.bar';
    const protocols = ['http://', '//', 'https://', 'ws://', 'WHATEVER://', 'file://'];
    const baseOrigins = protocols.map(p => p + domainName);

    baseOrigins.forEach(baseUrl => {
      expect(isTheSameDomain(`https://${domainName}/bar.js`, baseUrl)).toBeTruthy();
    });
    baseOrigins.forEach(baseUrl => {
      expect(isTheSameDomain('https://anotherdomain.com/bar.js', baseUrl)).toBeFalsy();
    });
  });

  it('recognizes the same domains if protocol is omitted', () => {
    expect(isTheSameDomain(baseOrigin.replace('https://', ''), baseOrigin)).toBeTruthy();
  });

  it('recognizes different domains', () => {
    expect(isTheSameDomain(baseOrigin.replace('bar', 'baz'), baseOrigin)).toBeFalsy();
    expect(isTheSameDomain(baseOrigin.replace('foo', 'baz'), baseOrigin)).toBeFalsy();
    expect(isTheSameDomain(baseOrigin.replace('foo', 'baz.foo'), baseOrigin)).toBeFalsy();
  });

  it('recognizes the same domain in a full url', () => {
    expect(isTheSameDomain(baseOrigin, baseOrigin + '/foo/bar')).toBeTruthy();
  });

  it('throws when second arg is a relative url', () => {
    expect(() => isTheSameDomain(baseOrigin, '/foo/bar/')).toThrow();
    expect(() => isTheSameDomain(baseOrigin, 'foo')).toThrow();
    expect(() => isTheSameDomain(baseOrigin, '')).toThrow();
  });
});
