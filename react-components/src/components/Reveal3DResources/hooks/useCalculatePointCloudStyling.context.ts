import { createContext } from 'react';
import { use3dModels } from '../../../hooks';

export type UseCalculatePointCloudStylingDependendencies = {
  use3dModels: typeof use3dModels;
};

export const defaultUseCalculatePointCloudStylingDependencies: UseCalculatePointCloudStylingDependendencies =
  {
    use3dModels
  };

export const UseCalculatePointCloudStylingContext =
  createContext<UseCalculatePointCloudStylingDependendencies>(
    defaultUseCalculatePointCloudStylingDependencies
  );
