import { extendedConfigurations } from '__fixtures__/fixtureConfigurations';

import { getProgressStats } from '../progress';

describe('progress', () => {
  describe('getProgressStats', () => {
    const [record] = extendedConfigurations;

    it('returns the right progress for given key', () => {
      const result = getProgressStats(record, 'PointSet');
      expect(result).toBe(100);
    });
    it('returns 0 if key is not present in progress', () => {
      const result = getProgressStats(record, 'FaultInterpretation');
      expect(result).toBe(0);
    });
    it('returns 0 for random key', () => {
      const result = getProgressStats(record, 'test');
      expect(result).toBe(0);
    });
  });
});
