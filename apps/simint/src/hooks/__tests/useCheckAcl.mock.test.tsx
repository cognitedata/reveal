import { renderHook } from '@testing-library/react';

import { useCheckAcl } from '../useCheckAcl';

const mockedUseGetDefinitionsQuery = jest.fn();
jest.mock('@simint-app/hooks/useCapabilities', () => ({
  useCapabilities: jest.fn(),
}));

jest.mock('@cognite/simconfig-api-sdk/rtk/index.js', () => ({
  useGetDefinitionsQuery: () => mockedUseGetDefinitionsQuery(),
}));

describe('useCheckAcl - with BFF responding with enabled on all permissions', () => {
  beforeEach(() => {
    mockedUseGetDefinitionsQuery.mockReturnValue({
      data: {
        features: [
          {
            name: 'Events',
            key: 'ui-events-acl',
            capabilities: [
              {
                capability: 'eventsAcl',
                actions: ['READ', 'WRITE'],
                scopes: ['all', 'datasetScope'],
                enabled: true,
                missingRequiredActions: [],
              },
            ],
          },
          {
            name: 'Files',
            key: 'ui-files-acl',
            capabilities: [
              {
                capability: 'filesAcl',
                actions: ['READ', 'WRITE'],
                scopes: ['all', 'datasetScope'],
                enabled: true,
                missingRequiredActions: [],
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      isSuccess: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the capability map and hasAllCapabilities flag', () => {
    const requiredCapabilities = ['ui-events-acl', 'ui-files-acl'];

    const { result } = renderHook(() => useCheckAcl(requiredCapabilities));

    expect(result.current.capabilityMap['ui-files-acl'].found).toBe(true);
    expect(result.current.capabilityMap['ui-events-acl'].found).toBe(true);
    expect(result.current.hasAllCapabilities).toBe(true);
  });

  it('should handle missing capabilities', () => {
    const requiredCapabilities = ['ui-unknown-acl', 'ui-events-acl'];
    const { result } = renderHook(() => useCheckAcl(requiredCapabilities));

    expect(result.current.capabilityMap['ui-unknown-acl'].found).toBe(false);
    expect(Object.entries(result.current.capabilityMap).length).toBe(2);
    expect(result.current.hasAllCapabilities).toBe(false);
  });
});

describe('useCheckAcl - with BFF responding with enabled on false on some permissions', () => {
  beforeEach(() => {
    mockedUseGetDefinitionsQuery.mockReturnValue({
      data: {
        features: [
          {
            name: 'Events',
            key: 'ui-events-acl',
            capabilities: [
              {
                capability: 'eventsAcl',
                actions: ['READ', 'WRITE'],
                scopes: ['all', 'datasetScope'],
                enabled: false,
                missingRequiredActions: [],
              },
            ],
          },
          {
            name: 'Files',
            key: 'ui-files-acl',
            capabilities: [
              {
                capability: 'filesAcl',
                actions: ['READ', 'WRITE'],
                scopes: ['all', 'datasetScope'],
                enabled: true,
                missingRequiredActions: [],
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      isSuccess: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the capability map and hasAllCapabilities flag', () => {
    const requiredCapabilities = ['ui-events-acl', 'ui-files-acl'];

    const { result } = renderHook(() => useCheckAcl(requiredCapabilities));

    expect(result.current.capabilityMap['ui-files-acl'].found).toBe(true);
    expect(result.current.capabilityMap['ui-events-acl'].found).toBe(false);
    expect(result.current.hasAllCapabilities).toBe(false);
  });
});
