import { match } from '..';

describe('match', () => {
  it('should highlight at the beginning of a word', () => {
    expect(match('some text', 'te')).toEqual([[5, 7]]);
  });

  it('should not highlight at the middle of a word', () => {
    expect(match('some text', 'e')).toEqual([]);
  });

  it('should highlight at the middle of a word', () => {
    expect(match('some text', 'e', { insideWords: true })).toEqual([[3, 4]]);
  });

  it('should highlight only the first match by default', () => {
    expect(match('some sweet text', 's')).toEqual([[0, 1]]);
  });

  it('should highlight all the matches when query has multiple words', () => {
    expect(match('some sweet text', 's s')).toEqual([
      [0, 1],
      [5, 6],
    ]);
  });

  it('should highlight all the matches at the beginning of a word', () => {
    expect(match('some sweet text', 's', { findAllOccurrences: true })).toEqual(
      [
        [0, 1],
        [5, 6],
      ]
    );
  });

  it('should highlight all the matches index words', () => {
    expect(
      match('some sweet text', 'e', {
        insideWords: true,
        findAllOccurrences: true,
      })
    ).toEqual([
      [3, 4],
      [7, 8],
      [8, 9],
      [12, 13],
    ]);
  });

  it("should highlight when case doesn't match", () => {
    expect(match('Some Text', 't')).toEqual([[5, 6]]);
  });

  // Enable this if we decide of ignoring diacritics
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should remove diacritics when highlighting', () => {
    expect(match('Déjà vu', 'deja')).toEqual([[0, 4]]);
  });

  // Enable this if we decide of ignoring diacritics
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should highlight diacritics', () => {
    expect(match('Déjà vu', 'déjà')).toEqual([[0, 4]]);
  });

  it('should sort the matches', () => {
    expect(match('Albert Einstein', 'e a')).toEqual([
      [0, 1],
      [7, 8],
    ]);
  });

  it('should highlight special characters', () => {
    expect(
      match(
        "this & doesn't, (makesense) or is-it?",
        "(makesense) doesn't, is-it? &"
      )
    ).toEqual([
      [5, 6],
      [7, 15],
      [16, 27],
      [31, 37],
    ]);
  });

  it('should ignore whitespaces in query', () => {
    expect(match('Very nice day', '\td   \n\n ver \t\t   ni \n')).toEqual([
      [0, 3],
      [5, 7],
      [10, 11],
    ]);
  });

  it('should not highlight anything if the query is blank', () => {
    expect(match('Very nice day', ' ')).toEqual([]);
  });

  it('should not merge the matches', () => {
    expect(match('Very nice day', 'very nice day')).toEqual([
      [0, 4],
      [5, 9],
      [10, 13],
    ]);
  });

  it('should partially highlight', () => {
    expect(match('some text', 's sweet')).toEqual([[0, 1]]);
  });

  it('should not highlight anything', () => {
    expect(match('some text', 's sweet', { requireMatchAll: true })).toEqual(
      []
    );
  });

  it('should highlight all words in query', () => {
    expect(
      match('some sweet text', 's sweet', { requireMatchAll: true })
    ).toEqual([
      [0, 1],
      [5, 10],
    ]);
  });
});
