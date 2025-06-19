import { createContext } from 'react';
import { use3dModels } from '../hooks';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';

export type UsePointCloudModelRevisionIdsFromRevealDependencies = {
  use3dModels: typeof use3dModels;
  useFdmSdk: typeof useFdmSdk;
};

export const UsePointCloudModelRevisionIdsFromRevealContext =
  createContext<UsePointCloudModelRevisionIdsFromRevealDependencies>({
    use3dModels,
    useFdmSdk
  });
