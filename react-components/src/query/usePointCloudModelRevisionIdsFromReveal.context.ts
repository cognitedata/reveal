import { Context, createContext } from 'react';
import { use3dModels } from '../hooks/use3dModels';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';

export type UsePointCloudModelRevisionIdsFromRevealDependencies = {
  use3dModels: typeof use3dModels;
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUsePointCloudModelRevisionIdsFromRevealDependencies: UsePointCloudModelRevisionIdsFromRevealDependencies =
  {
    use3dModels,
    useFdmSdk
  };

export const UsePointCloudModelRevisionIdsFromRevealContext: Context<UsePointCloudModelRevisionIdsFromRevealDependencies> =
  createContext<UsePointCloudModelRevisionIdsFromRevealDependencies>({
    use3dModels,
    useFdmSdk
  });
