import { toHashMap } from '../toHashMap';

describe('toHashMap', () => {
  it('should convert properties to a hash map', () => {
    expect(toHashMap(['A', 'B', 'C', 'D'])).toEqual({
      65: ['A'],
      66: ['B'],
      67: ['C'],
      68: ['D'],
    });
  });

  it('should return multiple properties with same hash value', () => {
    const propertiesHasSameHasValue = ['DRLC', 'NDBO'];
    expect(toHashMap(propertiesHasSameHasValue)).toEqual({
      728: propertiesHasSameHasValue,
    });
  });
});
