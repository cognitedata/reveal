import { getHashValuesFromHashMap } from '../getHashValuesFromHashMap';

describe('getHashValuesFromHashMap', () => {
  it('should return the hash values of the hash map', () => {
    const hashMap = {
      65: 'A',
      66: 'B',
      67: 'C',
      68: 'D',
    };
    expect(getHashValuesFromHashMap(hashMap)).toEqual([65, 66, 67, 68]);
  });
});
