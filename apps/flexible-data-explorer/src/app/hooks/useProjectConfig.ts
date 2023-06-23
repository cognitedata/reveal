import { useSDK } from '@cognite/sdk-provider';

import { customerConfig } from '../../config';

export const useProjectConfig = () => {
  const { project } = useSDK();

  return customerConfig.filter((item) => item.project === project);
};
