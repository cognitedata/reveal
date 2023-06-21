import { mergeUniqueMetadataKeys } from './utils';

describe('@data-exploration-components/utils', () => {
  describe('mergeUnqieuMetadataKeys', () => {
    it('Merges the metadata fields across objects', () => {
      const data = [
        {
          metadata: {
            test: 'test 1',
            filename: 'x',
          },
        },
        {
          metadata: {
            test: 'test 2',
            filename: 'y',
          },
        },
      ];
      const result = mergeUniqueMetadataKeys(data);

      expect(result).toMatchObject({
        test: ['test 1', 'test 2'],
        filename: ['x', 'y'],
      });
    });

    it('Removes duplicate values from keys in metadata', () => {
      const data = [
        {
          metadata: {
            test: 'test',
          },
        },
        {
          metadata: {
            test: 'test',
          },
        },
      ];

      const result = mergeUniqueMetadataKeys(data);

      expect(result).toMatchObject({
        test: ['test'],
      });
    });
  });
});
