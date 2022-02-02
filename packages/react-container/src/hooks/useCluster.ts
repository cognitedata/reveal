import { useState } from 'react';
import { SidecarConfig } from '@cognite/sidecar';
import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';

import { getNewDomain } from '../utils/domain';

export const useCluster = (
  sidecar: SidecarConfig
): [string, (s: string) => void] => {
  const initialCluster = getFromLocalStorage<string>('initialCluster');
  const [cluster, setInitialCluster] = useState(
    initialCluster &&
      sidecar.availableClusters?.find((set) =>
        set.options?.find((cluster) => cluster.value === initialCluster)
      )
      ? initialCluster
      : sidecar.cdfCluster
  );
  const setCluster = (cluster: string) => {
    saveToLocalStorage('initialCluster', cluster);
    setInitialCluster(cluster);
    const { hostname } = window.location;
    window.location.href = `//${getNewDomain(hostname, cluster)}`;
  };

  return [cluster, setCluster];
};
