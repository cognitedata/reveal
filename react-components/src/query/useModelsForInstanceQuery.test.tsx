import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useModelsForInstanceQuery } from './useModelsForInstanceQuery';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { Mock } from 'moq.ts';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { type FC, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type CogniteClient } from '@cognite/sdk';
import { type TaggedAddResourceOptions } from '../components';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultModelsForInstanceQueryDependencies,
  UseModelsForInstanceQueryContext
} from './useModelsForInstanceQuery.context';

const queryClient = new QueryClient();

const mockAddOptionsData1: TaggedAddResourceOptions[] = [
  { type: 'cad', addOptions: { modelId: 1, revisionId: 2 } }
];

const mockAddOptionsData2: TaggedAddResourceOptions[] = [
  { type: 'pointcloud', addOptions: { modelId: 3, revisionId: 4 } }
];

const mockAddOptionsData3: TaggedAddResourceOptions[] = [
  { type: 'cad', addOptions: { modelId: 5, revisionId: 6 } }
];

const mockFdmDataProvider = new Mock<Fdm3dDataProvider>()
  .setup((p) => p.getCadModelsForInstance)
  .returns(() => Promise.resolve(mockAddOptionsData1))
  .object();

const sdkMock = new Mock<CogniteClient>()
  .setup((p) => p.getBaseUrl())
  .returns('https://api.cognitedata.com')
  .setup((p) => p.project)
  .returns('test-project')
  .object();

const fdmSdkMock = new Mock<FdmSDK>().object();

const mockGetCadModelsForHybrid = vi.fn().mockResolvedValue(mockAddOptionsData3);
const defaultDependencies = getMocksByDefaultDependencies(
  defaultModelsForInstanceQueryDependencies
);
const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <UseModelsForInstanceQueryContext.Provider value={defaultDependencies}>
      {children}
    </UseModelsForInstanceQueryContext.Provider>
  </QueryClientProvider>
);

describe(useModelsForInstanceQuery.name, () => {
  const dmsInstance1 = { externalId: 'ext-id', space: 'space-id' };
  const dmsInstance2 = { externalId: 'ext-id-2', space: 'space-id-2' };

  beforeEach(() => {
    queryClient.clear();
    defaultDependencies.useSDK.mockReturnValue(sdkMock);
    defaultDependencies.useFdmSdk.mockReturnValue(fdmSdkMock);
    defaultDependencies.useFdm3dDataProvider.mockReturnValue(mockFdmDataProvider);
    defaultDependencies.useIsCoreDmOnly.mockReturnValue(true);
    defaultDependencies.getCadModelsForHybridDmInstance.mockImplementation(mockGetCadModelsForHybrid);
    defaultDependencies.getPointCloudModelsForAssetInstance.mockResolvedValue([]);
  });

  it('returns [] if isCoreDm is true and fdm3dDataProvider is undefined', async () => {
    defaultDependencies.useIsCoreDmOnly.mockReturnValue(true);
    defaultDependencies.useFdm3dDataProvider.mockReturnValue(undefined);

    const { result } = renderHook(() => useModelsForInstanceQuery(dmsInstance1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  it('calls getModelsForDmsInstance if isCoreDm is true and fdm3dDataProvider is defined with the correct parameters', async () => {

    defaultDependencies.useIsCoreDmOnly.mockReturnValue(true);
    defaultDependencies.getPointCloudModelsForAssetInstance.mockResolvedValue(mockAddOptionsData2);
    const mockModels = mockAddOptionsData1.concat(mockAddOptionsData2);

    const { result } = renderHook(() => useModelsForInstanceQuery(dmsInstance2), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockModels);
    });
  });

  it('calls getModelsForHybridInstance if isCoreDm is false', async () => {
    defaultDependencies.useIsCoreDmOnly.mockReturnValue(false);
    const mockModels = mockAddOptionsData3;
    mockGetCadModelsForHybrid.mockResolvedValueOnce(mockModels);

    const { result } = renderHook(() => useModelsForInstanceQuery(dmsInstance1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockModels);
    });
  });
});
