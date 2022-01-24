import { config } from '../config';
import { CdfApiConfig } from '../types';

export function createConfigDefaults(config: CdfApiConfig): CdfApiConfig {
  const newConfig = { ...config };

  if (!newConfig.version) {
    newConfig.version = 1;
  }

  newConfig.urlRewrites = Object.assign(newConfig.urlRewrites || {}, {
    '/api/v1/projects/*': '/$1',
    '/:resource/list': '/:resource',
    '/:resource/search': '/:resource',
    '/:resource/byids': '/:resource',
    '/templategroups/:templategroups_id/versions/list':
      '/templates?templategroups_id=:templategroups_id&_sort=version&_order=desc',
  });

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
