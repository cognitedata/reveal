import { useMemo } from 'react';

import { useSDK } from '@cognite/sdk-provider';

import { customerConfig } from '../config';

import { useSelectedSiteLocalStorage } from './useLocalStorage';

export const useProjectConfig = () => {
  const { project } = useSDK();

  return useMemo(
    () => customerConfig.find((item) => item.project === project),
    [project]
  );
};

export const useSelectedSiteConfig = () => {
  const [selectedSite] = useSelectedSiteLocalStorage();

  const config = useProjectConfig();

  if (!selectedSite || !config) {
    return undefined;
  }

  // Development purposes only
  if (selectedSite === 'Custom') {
    return {
      name: 'Custom',
    };
  }

  return config?.sites?.find((site) => site.name === selectedSite);
};
