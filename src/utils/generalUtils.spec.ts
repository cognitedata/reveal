import { splitListIntoChunks } from './generalUtils';

describe('Test splitting list into chunks', () => {
  it('should chunk list of strings into equal parts', () => {
    expect(splitListIntoChunks(['1', '2', '3', '4'], 2)).toStrictEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('should chunk list of objects into equal parts', () => {
    expect(
      splitListIntoChunks(
        [{ prop: 1 }, { prop: 2 }, { prop: 3 }, { prop: 4 }],
        2
      )
    ).toStrictEqual([
      [{ prop: 1 }, { prop: 2 }],
      [{ prop: 3 }, { prop: 4 }],
    ]);
  });

  it('should chunk list of numbers into equal parts', () => {
    expect(splitListIntoChunks([1, 2, 3, 4], 2)).toStrictEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('should chunk list of numbers into almost equal parts', () => {
    expect(splitListIntoChunks([1, 2, 3, 4, 5], 2)).toStrictEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it('should chunk list of numbers into one part if batch size is larger than length of items', () => {
    expect(splitListIntoChunks([1, 2, 3], 4)).toStrictEqual([[1, 2, 3]]);
  });

  it('should chunk list of numbers into one part if batch size is the same as length of items', () => {
    expect(splitListIntoChunks([1, 2, 3, 4, 5], 5)).toStrictEqual([
      [1, 2, 3, 4, 5],
    ]);
  });

  it('should chunk list of numbers into one part if batch size = 0', () => {
    expect(splitListIntoChunks([1, 2, 3, 4, 5], 0)).toStrictEqual([
      [1, 2, 3, 4, 5],
    ]);
  });
  it('should chunk list of numbers into one part if batch size < 0', () => {
    expect(splitListIntoChunks([1, 2, 3, 4, 5], -2)).toStrictEqual([
      [1, 2, 3, 4, 5],
    ]);
  });

  it('should chunk list of empty into one part', () => {
    expect(splitListIntoChunks([], 3)).toStrictEqual([[]]);
  });
});
