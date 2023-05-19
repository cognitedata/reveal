import { parseEnvFromCluster, parseEnvLabelFromCluster } from '.';

describe('Shared utils', () => {
  describe('parseEnvFromCluster', () => {
    it('Should parse cluster from cluster hostname', () => {
      expect(parseEnvFromCluster('bluefield.cognitedata.com')).toBe(
        'bluefield'
      );
    });

    it('Should parse cluster from cluster URL', () => {
      expect(parseEnvFromCluster('https://bluefield.cognitedata.com')).toBe(
        'bluefield'
      );
      expect(parseEnvFromCluster('http://bluefield.cognitedata.com')).toBe(
        'bluefield'
      );
    });

    it('Should return empty string for `api` cluster', () => {
      expect(parseEnvFromCluster('api.cognitedata.com')).toBe('');
    });
  });

  describe('parseEnvLabelFromCluster', () => {
    it('Should return environment label for known cluster', () => {
      expect(parseEnvLabelFromCluster('api.cognitedata.com')).toBe(
        'Europe 1 (Google)'
      );
    });

    it('Should return cluster name for unknown cluster hostname', () => {
      expect(parseEnvLabelFromCluster('bluefield.cognitedata.com')).toBe(
        'bluefield'
      );
    });

    it('Should return cluster name for unknown cluster URL', () => {
      expect(
        parseEnvLabelFromCluster('https://bluefield.cognitedata.com')
      ).toBe('bluefield');
      expect(parseEnvLabelFromCluster('http://bluefield.cognitedata.com')).toBe(
        'bluefield'
      );
    });
  });
});
