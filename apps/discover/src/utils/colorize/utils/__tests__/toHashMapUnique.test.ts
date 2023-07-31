import { toHashMapUnique } from '../toHashMapUnique';

describe('toHashMapUnique', () => {
  it('should convert properties to a hash map only with unique values', () => {
    /**
     * `DRLC` and `NDBO` has the same hash value.
     * Here, it should overwrite `DRLC` from `NDBO`
     */
    expect(toHashMapUnique(['DRLC', 'NDBO'])).toEqual({
      728: 'NDBO',
    });
  });
});
