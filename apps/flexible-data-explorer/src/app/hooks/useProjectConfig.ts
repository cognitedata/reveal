import { useMemo } from 'react';

import { useSDK } from '@cognite/sdk-provider';

import { customerConfig } from '../../config';

export const useProjectConfig = () => {
  const { project } = useSDK();

  return useMemo(
    () => customerConfig.find((item) => item.project === project),
    [project]
  );
};
