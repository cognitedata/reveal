import { parse } from '..';

describe('parse', () => {
  it('should highlight a single partial match', () => {
    expect(parse('Hello world', [[0, 4]])).toEqual([
      {
        text: 'Hell',
        highlight: true,
      },
      {
        text: 'o world',
        highlight: false,
      },
    ]);
  });

  it('should highlight a single complete match', () => {
    expect(parse('Hello world', [[0, 11]])).toEqual([
      {
        text: 'Hello world',
        highlight: true,
      },
    ]);
  });

  it('should highlight multiple non-consecutive matches', () => {
    expect(
      parse('Hello world', [
        [2, 4],
        [6, 8],
      ])
    ).toEqual([
      {
        text: 'He',
        highlight: false,
      },
      {
        text: 'll',
        highlight: true,
      },
      {
        text: 'o ',
        highlight: false,
      },
      {
        text: 'wo',
        highlight: true,
      },
      {
        text: 'rld',
        highlight: false,
      },
    ]);
  });

  it('should highlight multiple consecutive matches', () => {
    expect(
      parse('Hello world', [
        [2, 4],
        [4, 8],
      ])
    ).toEqual([
      {
        text: 'He',
        highlight: false,
      },
      {
        text: 'll',
        highlight: true,
      },
      {
        text: 'o wo',
        highlight: true,
      },
      {
        text: 'rld',
        highlight: false,
      },
    ]);
  });

  it('should not highlight the text if there are no matches', () => {
    expect(parse('Hello world', [])).toEqual([
      {
        text: 'Hello world',
        highlight: false,
      },
    ]);
  });
});
