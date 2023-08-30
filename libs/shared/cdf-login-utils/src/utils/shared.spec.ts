import { getBaseHostname, getOrganization } from './loginInfo';
import { parseEnvFromCluster, parseEnvLabelFromCluster } from './shared';

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

  describe('getOrganization', () => {
    it.each([
      ['abc.fusion.cognite.com', 'abc'],
      ['fusion.cognite.com', null],
      ['abc.next-release.fusion.cognite.com', 'abc'],
      ['next-release.fusion.cognite.com', null],
      ['abc.staging.fusion.cognite.com', 'abc'],
      ['staging.fusion.cognite.com', null],
      ['abc.dev.fusion.cogniteapp.com', 'abc'],
      ['dev.fusion.cogniteapp.com', null],
      ['abc.fusion-pr-preview.cogniteapp.com', 'abc'],
      ['fusion-pr-preview.cogniteapp.com', null],
      ['fusion-shell-2833.fusion-preview.preview.cogniteapp.com', null],
      ['abc.fusion-shell-2833.fusion-preview.preview.cogniteapp.com', 'abc'],
      ['abc.local.cognite.ai', 'abc'],
      ['local.cognite.ai', null],
      ['abc.localhost', 'abc'],
      ['localhost', null],
      ['abc.fusion.cognitedata-development.cognite.ai', 'abc'],
      ['fusion.cognitedata-development.cognite.ai', null],
    ])("organization for the url '%s' should be '%s", (text, expected) => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: text,
        },
        writable: true,
      });
      expect(getOrganization()).toBe(expected);
    });
  });

  describe('getBaseHostname', () => {
    it.each([
      ['abc.fusion.cognite.com', 'fusion.cognite.com'],
      ['fusion.cognite.com', 'fusion.cognite.com'],
      [
        'abc.next-release.fusion.cognite.com',
        'next-release.fusion.cognite.com',
      ],
      ['next-release.fusion.cognite.com', 'next-release.fusion.cognite.com'],
      ['abc.staging.fusion.cognite.com', 'staging.fusion.cognite.com'],
      ['staging.fusion.cognite.com', 'staging.fusion.cognite.com'],
      ['abc.dev.fusion.cogniteapp.com', 'dev.fusion.cogniteapp.com'],
      ['dev.fusion.cogniteapp.com', 'dev.fusion.cogniteapp.com'],
      [
        'abc.fusion-pr-preview.cogniteapp.com',
        'fusion-pr-preview.cogniteapp.com',
      ],
      ['fusion-pr-preview.cogniteapp.com', 'fusion-pr-preview.cogniteapp.com'],
      [
        'fusion-shell-2833.fusion-preview.preview.cogniteapp.com',
        'fusion-shell-2833.fusion-preview.preview.cogniteapp.com',
      ],
      [
        'abc.fusion-shell-2833.fusion-preview.preview.cogniteapp.com',
        'fusion-shell-2833.fusion-preview.preview.cogniteapp.com',
      ],
      ['abc.local.cognite.ai', 'local.cognite.ai'],
      ['local.cognite.ai', 'local.cognite.ai'],
      ['abc.localhost', 'localhost'],
      ['localhost', 'localhost'],
      [
        'abc.fusion.cognitedata-development.cognite.ai',
        'fusion.cognitedata-development.cognite.ai',
      ],
      [
        'fusion.cognitedata-development.cognite.ai',
        'fusion.cognitedata-development.cognite.ai',
      ],
    ])("base hostname for '%s' should be '%s", (text, expected) => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: text,
        },
        writable: true,
      });
      expect(getBaseHostname()).toBe(expected);
    });
  });
});
