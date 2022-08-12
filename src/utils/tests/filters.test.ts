import { countByFilter } from '../filters';

describe('FilterUtils', () => {
  describe('countByFilter', () => {
    it('should return the asset filter count correctly', () => {
      const filter = {
        source: 'carina',
        assetSubtreeIds: [
          {
            id: 1918823365845105,
          },
        ],
        createdTime: {
          max: 1660202468925,
        },
        lastUpdatedTime: {
          min: 1628666541000,
          max: 1660202541459,
        },
      };
      const result = countByFilter(filter);
      expect(result).toBe(4);
    });

    it('should return the time series filter count correctly', () => {
      const filter = {
        isStep: true,
        isString: true,
        externalIdPrefix: 'ext',
      };
      const result = countByFilter(filter);
      expect(result).toBe(3);
    });

    it('should return the file filter count correctly', () => {
      const filter = {
        mimeType: 'application/pdf',
        metadata: {
          'document:title': 'EC Declaration of Conformity',
        },
        labels: {
          containsAny: [
            {
              externalId: 'BEST_DAY_STREAM_FLUID_PRODUCED_WATER',
            },
            {
              externalId: 'BEST_DAY_FUTURE_DEFERMENT_CONTRIBUTION_H2O_NET',
            },
          ],
        },
      };
      const result = countByFilter(filter);
      expect(result).toBe(3);
    });
  });
});
