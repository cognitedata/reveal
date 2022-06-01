import {
  getHashMapReverse,
  reverseHashMapKeyValuePair,
} from '../getHashMapReverse';

describe('getHashMapReverse', () => {
  it('should return the reverse map of the hash table', () => {
    expect(
      getHashMapReverse({
        1: ['A'],
        2: ['B', 'C'],
        3: ['D'],
      })
    ).toEqual({
      A: 1,
      B: 2,
      C: 2,
      D: 3,
    });
  });
});

describe('reverseHashMapKeyValuePair', () => {
  it('should reverse hash map key value pair', () => {
    expect(reverseHashMapKeyValuePair(1, ['A'])).toEqual({ A: 1 });
    expect(reverseHashMapKeyValuePair(2, ['B', 'C'])).toEqual({ B: 2, C: 2 });
  });
});
