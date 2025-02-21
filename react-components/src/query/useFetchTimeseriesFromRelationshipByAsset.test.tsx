/*!
 * Copyright 2025 Cognite AS
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CogniteClient, type Asset, type Timeseries } from '@cognite/sdk';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import type { ExtendedRelationshipWithSourceAndTarget } from '../data-providers/types';
import { getResourceRelationship } from '../hooks/network/getResourceRelationship';
import { useFetchTimeseriesFromRelationshipByAsset } from './useFetchTimeseriesFromRelationshipByAsset';

const sdk = {
  post: vi.fn().mockResolvedValue({ data: {} }),
  project: 'project'
} as unknown as CogniteClient;

const mockTimeseries: Timeseries[] = [
  {
    id: 1,
    externalId: 'timeseries-1',
    assetId: 1,
    isString: false,
    isStep: true,
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date()
  },
  {
    id: 2,
    externalId: 'timeseries-2',
    assetId: 1,
    isString: false,
    isStep: false,
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date()
  }
];

const mockAssets: Asset[] = [
  {
    id: 1,
    externalId: 'asset-1',
    name: 'Asset 1',
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    rootId: 0
  },
  {
    id: 2,
    externalId: 'asset-2',
    name: 'Asset 2',
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    rootId: 0
  }
];

const extendedRelationship: ExtendedRelationshipWithSourceAndTarget[] = [
  {
    externalId: 'relationship-1',
    sourceExternalId: 'asset-1',
    targetExternalId: 'timeseries-1',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    source: {
      id: 1,
      externalId: 'asset-1',
      isString: false,
      isStep: false,
      description: '',
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      metadata: {
        name: 'Asset 1'
      }
    },
    target: mockTimeseries[0],
    sourceType: 'asset',
    targetType: 'timeSeries',
    relation: 'Source'
  },
  {
    externalId: 'relationship-2',
    sourceExternalId: 'asset-1',
    targetExternalId: 'timeseries-1',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    source: {
      id: 1,
      externalId: 'asset-1',
      isString: false,
      isStep: false,
      description: '',
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      metadata: {
        name: 'Asset 1'
      }
    },
    target: mockTimeseries[1],
    sourceType: 'asset',
    targetType: 'timeSeries',
    relation: 'Source'
  }
];

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: any }): any => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('../../../src/hooks/network/getResourceRelationship');
vi.mock('../../../src/components/RevealCanvas/SDKProvider');

vi.mocked(useSDK).mockReturnValue(sdk);

describe('useFetchTimeseriesFromRelationshipByAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should return step and non-step time series with an asset as the input', async () => {
    vi.mocked(getResourceRelationship).mockResolvedValue(extendedRelationship);

    const { result } = renderHook(
      () =>
        useFetchTimeseriesFromRelationshipByAsset({
          asset: mockAssets[0],
          filter: { isStep: true },
          resourceTypes: ['timeSeries']
        }),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([
        extendedRelationship[0].target,
        extendedRelationship[1].target
      ]);
    });
  });

  it('should return only non-step time series with an asset as the input', async () => {
    vi.mocked(getResourceRelationship).mockResolvedValue(extendedRelationship);

    const { result } = renderHook(
      () =>
        useFetchTimeseriesFromRelationshipByAsset({
          asset: mockAssets[0],
          filter: { isStep: false },
          resourceTypes: ['timeSeries']
        }),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([extendedRelationship[1].target]);
    });
  });

  it('should return empty time series list when has no time series linked to the input asset', async () => {
    vi.mocked(getResourceRelationship).mockResolvedValue([]);

    const { result } = renderHook(
      () =>
        useFetchTimeseriesFromRelationshipByAsset({
          asset: mockAssets[1],
          filter: { isStep: false },
          resourceTypes: ['timeSeries']
        }),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });
});
