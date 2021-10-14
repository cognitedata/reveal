import { UseQueryResult, useQuery } from 'react-query';

import isUndefined from 'lodash/isUndefined';

import { getTenantInfo } from '@cognite/react-container';

import defaultConfig from 'tenants/config';
import { TenantConfig } from 'tenants/types';

export const fetchTenantFile = (tenant: string, file: string) => {
  return import(`tenants/${tenant}/${file}`).then(({ default: result }) => {
    return result;
  });
};

export const fetcher = async (tenant: string): Promise<TenantConfig> => {
  try {
    const config = await fetchTenantFile(tenant, 'config');

    if (config) {
      return config;
    }

    return defaultConfig;
  } catch (_) {
    return defaultConfig;
  }
};

export const useTenantConfig = (): UseQueryResult<TenantConfig> => {
  const [tenant] = getTenantInfo();
  return useQuery<TenantConfig>(['tenant-config', tenant], () =>
    fetcher(tenant)
  );
};

export const useTenantConfigByKey = <T>(key: keyof TenantConfig) => {
  const result = useTenantConfig();

  return {
    ...result,
    data: result.data
      ? getTenantConfigKeyValue<T>(
          result.data[key] as T,
          defaultConfig[key] as T
        )
      : undefined,
  };
};

export const getTenantConfigKeyValue = <T>(value: T, defaultValue: T) => {
  if (!isUndefined(value)) return value;
  if (!isUndefined(defaultValue)) return defaultValue;
  return undefined;
};
