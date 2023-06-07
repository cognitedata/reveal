import { config } from '../config';
import { CdfApiConfig } from '../types';

export function mergeConfigs(
  firstApiConfig: CdfApiConfig,
  secondApiConfig: CdfApiConfig
): CdfApiConfig {
  const newConfig = { ...firstApiConfig };

  if (!newConfig.version) {
    newConfig.version = 1;
  }

  newConfig.ignoreUrlPatterns = (newConfig.ignoreUrlPatterns || []).concat(
    secondApiConfig.ignoreUrlPatterns
  );

  newConfig.urlRewrites = Object.assign(
    newConfig.urlRewrites || {},
    secondApiConfig.urlRewrites
  );

  newConfig.endpoints = Object.assign(
    newConfig.endpoints || {},
    secondApiConfig.endpoints
  );

  return newConfig;
}

export const createDefaultMockApiEndpoints = (mockDb) => {
  const defaultApiMockEntries = config.defaultApiEndpoints;
  const cdfMockDb = { ...mockDb };
  const mockKeys = Object.keys(mockDb);

  defaultApiMockEntries.forEach((entry) => {
    if (!mockKeys.includes(entry)) {
      cdfMockDb[entry] = [];
    }
  });

  return cdfMockDb;
};
