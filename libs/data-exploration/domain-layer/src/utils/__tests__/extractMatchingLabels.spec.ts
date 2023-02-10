import { extractMatchingLabels, isExactMatch } from '../extractMatchingLabels';

describe('extractMatchingLabels', function () {
  it('should return correct result', () => {
    expect(
      extractMatchingLabels(
        { test: 'aBcde', test2: 'abc', test3: 'bc', foo: 'abcd' },
        'Abc',
        ['test', 'test2', 'test3', { key: 'foo', label: 'bar' }]
      )
    ).toEqual({
      exact: ['test2'],
      partial: ['test', 'bar'],
      fuzzy: [],
    });

    expect(
      extractMatchingLabels({ test: 1234, test2: 123, test3: '1234' }, '123', [
        'test',
        'test2',
        'test3',
      ])
    ).toEqual({
      exact: ['test2'],
      partial: ['test3'],
      fuzzy: [],
    });

    expect(
      extractMatchingLabels(
        { test: { foo: '1234', bar: '123' }, test2: ['1234', '123'] },
        '123',
        ['test', 'test2']
      )
    ).toEqual({
      exact: ['test bar', 'test2 123'],
      partial: ['test foo', 'test2 1234'],
      fuzzy: [],
    });

    expect(
      extractMatchingLabels(
        { test: 'aBcde', test2: 'abc', test3: 'bc' },
        'foobar',
        ['test', 'test2', 'test3']
      )
    ).toEqual({
      exact: [],
      partial: [],
      fuzzy: ['Name or Description'],
    });

    // custom label and matcher per property
    expect(
      extractMatchingLabels(
        { test: 'aBcde', test2: { externalId: 'abc' } },
        'abc',
        [
          'test',
          {
            key: 'test2',
            customMatcher: (value, query, matchers) => {
              if (isExactMatch(value.externalId, query)) {
                matchers.exact.push('New custom label');
              }
            },
          },
        ]
      )
    ).toEqual({
      exact: ['New custom label'],
      partial: ['test'],
      fuzzy: [],
    });
  });
});
