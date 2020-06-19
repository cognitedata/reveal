import { buildQueryString, QueryParameters } from './Api';

describe('Utility function buildQueryString', () => {
  test('... returns correct string from object', () => {
    const input: QueryParameters = {
      foo: 'bar',
      a: 1,
      b: true,
    };
    const output: string = 'foo=bar&a=1&b=true';
    expect(buildQueryString(input)).toEqual(output);
  });
});
