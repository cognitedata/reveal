import { getSetFromRecord } from '../getSetFromRecord';

describe('getSetFromRecord', () => {
  it('should be ok', () => {
    const mySet = new Set<number>();
    mySet.add(1);
    mySet.add(2);
    expect(getSetFromRecord(mySet, { 1: 'a', 2: 'b', 3: 'c' })).toEqual([
      'a',
      'b',
    ]);
  });
});
