import { SidecarConfig } from '@cognite/sidecar';

import { getNewDomain } from '../utils/domain';

export const useCluster = (
  sidecar: SidecarConfig
): [string, (s: string) => void] => {
  const setCluster = (cluster: string) => {
    const { hostname } = window.location;
    window.location.href = `//${getNewDomain(hostname, cluster)}`;
  };

  return [sidecar.cdfCluster, setCluster];
};
