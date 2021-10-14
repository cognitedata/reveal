import { renderHook } from '@testing-library/react-hooks';
import noop from 'lodash/noop';

import { getTenantInfo } from '@cognite/react-container';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';
import { Modules } from 'modules/sidebar/types';
import defaultConfig from 'tenants/config';
import defaultSubSurfaceConfig from 'tenants/subsurface-test/config';
import { AzureConfig, TenantConfig, WellConfig } from 'tenants/types';

import {
  fetcher,
  fetchTenantFile,
  useTenantConfigByKey,
} from '../useTenantConfig';

jest.mock('react-query', () => jest.requireActual('react-query'));

jest.mock('@cognite/react-container', () => ({
  getTenantInfo: jest.fn(),
}));

describe('useTenantConfig', () => {
  describe('fetchTenantFiles', () => {
    test('should get simple config - invalid tenant', async () => {
      let config;
      try {
        config = (await fetchTenantFile('ss', 'config')) as TenantConfig;
      } catch {
        noop();
      }

      expect(config).toEqual(undefined);
    });

    test('should get simple config - existing tenant, non-existant file', async () => {
      let config;

      try {
        config = await fetchTenantFile('akbp-subsurface', '__bad_file_name_');
      } catch {
        noop();
      }
      expect(config).toEqual(undefined);
    });

    test('should get simple config - existing tenant', async () => {
      const config = await fetchTenantFile('akbp-subsurface', 'config');
      expect(config).toBeTruthy();
    });
  });

  describe('fetcher function', () => {
    // Some cases are tested above, we are just gonna test the key here
    test('should return correct tenant config', async () => {
      const result = await fetcher('subsurface-test');

      expect(result).not.toBeUndefined();
      expect(result).toEqual(defaultSubSurfaceConfig);
    });

    test('should return default config for non-existent tenant', async () => {
      const result = await fetcher('subsurface-test-fake');

      expect(result).toEqual(defaultConfig);
    });
  });

  describe('useTenantConfigByKey query', () => {
    test('should return correct data for specific key', async () => {
      (getTenantInfo as jest.Mock).mockReturnValue(['subsurface-test']);

      const { result, waitForNextUpdate } = renderHook(
        () => useTenantConfigByKey<AzureConfig>('azureConfig'),
        { wrapper: QueryClientWrapper }
      );

      await waitForNextUpdate();
      expect(result.current.data).toEqual(defaultSubSurfaceConfig.azureConfig);
    });

    test('should return default data if key is not found in config', async () => {
      (getTenantInfo as jest.Mock).mockReturnValue(['subsurface-test']);

      const { result, waitForNextUpdate } = renderHook(
        () => useTenantConfigByKey<WellConfig>(Modules.WELLS),
        { wrapper: QueryClientWrapper }
      );
      await waitForNextUpdate();
      expect(result.current.data).toEqual(defaultConfig.wells);
    });

    test('should return undefined if key is not found in config or defaultConfig', async () => {
      (getTenantInfo as jest.Mock).mockReturnValue(['subsurface-test']);

      const { result, waitForNextUpdate } = renderHook(
        () => useTenantConfigByKey('externalLinks'),
        { wrapper: QueryClientWrapper }
      );

      await waitForNextUpdate();
      expect(result.current.data).toBeUndefined();
    });

    test('should return undefined for invalid key', async () => {
      (getTenantInfo as jest.Mock).mockReturnValue(['subsurface-test']);

      const { result, waitForNextUpdate } = renderHook(
        () => useTenantConfigByKey('invalid-key' as keyof TenantConfig),
        { wrapper: QueryClientWrapper }
      );

      await waitForNextUpdate();
      expect(result.current.data).toBeUndefined();
    });
  });
});
