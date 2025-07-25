import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useModelsForInstanceQuery } from './useModelsForInstanceQuery';
import { SDKProvider, useSDK } from '../components/RevealCanvas/SDKProvider';
import { useFdm3dDataProvider } from '../components/CacheProvider/CacheProvider';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { useIsCoreDmOnly } from '../hooks/useIsCoreDmOnly';
import { getCadModelsForHybrid } from '../hooks/network/getCadModelsForHybrid';
import { FdmSDK } from '../data-providers/FdmSDK';
import { Mock } from 'moq.ts';
import { Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { RevealRenderTarget } from '../architecture';
import { FC, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ViewerContext } from '../components/RevealCanvas/ViewerContext';
import { FdmSdkContext } from '../components/RevealCanvas/FdmDataProviderContext';
import { CogniteClient } from '@cognite/sdk';
import { getPointCloudModelsForAssetInstance } from '../hooks/network/getPointCloudModelsForAssetInstance';
import { TaggedAddResourceOptions } from '../components';

vi.mock(import('../hooks/network/getCadModelsForHybrid'), () => ({
  getCadModelsForHybrid: vi.fn()
}));
vi.mock(import('../hooks/network/getPointCloudModelsForAssetInstance'), () => ({
  getPointCloudModelsForAssetInstance: vi.fn()
}));

vi.mock(import('../components/RevealCanvas/SDKProvider'), async (importOriginal) => {
  return {
    ...await importOriginal(),
    useFdmSdk: vi.fn(),
    useSDK: vi.fn()
  };
});
vi.mock(import('../components/CacheProvider/CacheProvider'), async (importOriginal) => {
  return {
    ...await importOriginal(),
    useFdm3dDataProvider: vi.fn()
  };
});
vi.mock(import('../hooks/useIsCoreDmOnly'), () => ({
  useIsCoreDmOnly: vi.fn()
}));

const queryClient = new QueryClient();

const mockAddOptionsData1: TaggedAddResourceOptions[]= [
  { type: 'cad', addOptions: { modelId: 1, revisionId: 2 } }
];

const mockAddOptionsData2: TaggedAddResourceOptions[] = [
  { type: 'pointcloud', addOptions: { modelId: 3, revisionId: 4 } }
];

const mockAddOptionsData3: TaggedAddResourceOptions[] = [
  { type: 'cad', addOptions: { modelId: 5, revisionId: 6 } }
];

const mockGetCadModelsForInstance = vi.fn().mockResolvedValue(mockAddOptionsData1);

const mockFdmDataProvider = new Mock<Fdm3dDataProvider>()
  .setup((p) => p.getCadModelsForInstance)
  .returns(mockGetCadModelsForInstance)
  .object();

const sdkMock = new Mock<CogniteClient>()
  .setup((p) => p.getBaseUrl())
  .returns('https://api.cognitedata.com')
  .setup((p) => p.project)
  .returns('test-project')
  .object();

const fdmSdkMock = new Mock<FdmSDK>()
  .object();

const renderTargetMock = new Mock<RevealRenderTarget>();

const mockGetCadModelsForHybrid = vi.fn().mockResolvedValue(mockAddOptionsData3);

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <SDKProvider sdk={sdkMock}>
      <ViewerContext.Provider value={renderTargetMock.object()}>
        <FdmSdkContext.Provider value={{ fdmSdk: fdmSdkMock }}>
          {children}
        </FdmSdkContext.Provider>
      </ViewerContext.Provider>
    </SDKProvider>
  </QueryClientProvider>
);


describe(useModelsForInstanceQuery.name, () => {
  const dmsInstance1 = { externalId: 'ext-id', space: 'space-id' };
  const dmsInstance2 = { externalId: 'ext-id-2', space: 'space-id-2' };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useSDK).mockReturnValue(sdkMock);
    vi.mocked(useFdmSdk).mockReturnValue(fdmSdkMock);
    vi.mocked(useFdm3dDataProvider).mockReturnValue(mockFdmDataProvider);
    vi.mocked(useIsCoreDmOnly).mockReturnValue(true);
    vi.mocked(getCadModelsForHybrid).mockImplementation(mockGetCadModelsForHybrid);
    vi.mocked(getPointCloudModelsForAssetInstance).mockResolvedValue([]);
  });

  it('returns [] if isCoreDm is true and fdm3dDataProvider is undefined', async () => {
    vi.mocked(useIsCoreDmOnly).mockReturnValue(true);
    vi.mocked(useFdm3dDataProvider).mockReturnValue(undefined);

    const { result } = renderHook(() => useModelsForInstanceQuery(dmsInstance1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  it('calls getModelsForDmsInstance if isCoreDm is true and fdm3dDataProvider is defined with the correct parameters', async () => {
    const mockFdm3dDataProvider = useFdm3dDataProvider();
    if (mockFdm3dDataProvider) {
      vi.mocked(mockFdm3dDataProvider.getCadModelsForInstance).mockResolvedValue(mockAddOptionsData1);
    }
    vi.mocked(useIsCoreDmOnly).mockReturnValue(true);
    vi.mocked(getPointCloudModelsForAssetInstance).mockResolvedValue(mockAddOptionsData2);
    const mockModels = mockAddOptionsData1.concat(mockAddOptionsData2);

    const { result } = renderHook(() => useModelsForInstanceQuery(dmsInstance2), { wrapper });

    expect(mockGetCadModelsForInstance).toHaveBeenCalledWith(dmsInstance2);
    await waitFor(() => {
      expect(result.current.data).toEqual(mockModels)
    });
  });

  it('calls getModelsForHybridInstance if isCoreDm is false', async () => {
    vi.mocked(useIsCoreDmOnly).mockReturnValue(false);
    const mockModels = mockAddOptionsData3;
    mockGetCadModelsForHybrid.mockResolvedValueOnce(mockModels);

    const { result } = renderHook(() => useModelsForInstanceQuery(dmsInstance1), { wrapper });
    expect(mockGetCadModelsForHybrid).toHaveBeenCalledWith(dmsInstance1, sdkMock);
    await waitFor(() =>
      expect(result.current.data).toEqual(mockModels)
    );
  });
});
