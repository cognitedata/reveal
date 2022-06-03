import { config } from '../config';
import { CdfApiConfig } from '../types';

export function createConfigDefaults(cdfApiConfig: CdfApiConfig): CdfApiConfig {
  const newConfig = { ...cdfApiConfig };

  if (!newConfig.version) {
    newConfig.version = 1;
  }

  newConfig.urlRewrites = Object.assign(
    newConfig.urlRewrites || {},
    config.urlRewrites
  );

  if (!newConfig.endpoints) {
    newConfig.endpoints = {};
  }

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
