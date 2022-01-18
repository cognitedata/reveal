// Copyright 2021 Cognite AS
import {
  ICachePlugin,
  ISerializableTokenCache,
  TokenCacheContext,
} from '@azure/msal-common';
import { AUTH_CONFIG } from '../constants';
import { getProjectConfig, setProjectConfig } from './config';

const beforeCacheAccess = async (cacheContext: TokenCacheContext) => {
  await readFromCache(cacheContext.tokenCache);
};

export const readFromCache = async (tokenCache: ISerializableTokenCache) => {
  const config = getProjectConfig();
  const authCacheItem = config
    ? config[AUTH_CONFIG.MSAL_AUTH_CACHE]
    : undefined;
  if (authCacheItem) {
    tokenCache.deserialize(authCacheItem);
  }
};

const afterCacheAccess = async (cacheContext: TokenCacheContext) => {
  if (cacheContext.cacheHasChanged) {
    setProjectConfig({
      [AUTH_CONFIG.MSAL_AUTH_CACHE]: cacheContext.tokenCache.serialize(),
    });
  }
};

// Cache Plugin
export const cachePlugin: ICachePlugin = {
  beforeCacheAccess,
  afterCacheAccess,
};
