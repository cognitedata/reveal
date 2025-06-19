import { createContext } from 'react';
import { use3dModels } from '../hooks';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { useQuery } from '@tanstack/react-query';

export type UsePointCloudModelRevisionIdsFromRevealDependencies = {
  use3dModels: typeof use3dModels;
  useFdmSdk: typeof useFdmSdk;
};

export const UsePointCloudModelRevisionIdsFromRevealContext =
  createContext<UsePointCloudModelRevisionIdsFromRevealDependencies>({
    use3dModels,
    useFdmSdk
  });
