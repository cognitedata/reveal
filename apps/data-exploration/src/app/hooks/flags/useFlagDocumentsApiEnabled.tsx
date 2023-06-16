import { getCluster, getProject } from '@cognite/cdf-utilities';

export const useFlagDocumentsApiEnabled = () => {
  const ARAMCO_CLUSTER_URL = 'api-cdf.sapublichosting.com';
  const openshiftClusters = [
    ARAMCO_CLUSTER_URL, // sapc-01, AKA Saudi Aramco
    'openfield.cognitedata.com', // openfield
    'okd-dev-01.cognitedata.com', // okd-dev-01
    'okd-dbre-01.cognitedata.com', // okd-dbre-01
  ];

  const project = getProject(); //temporary
  const cluster = getCluster();

  return (
    project !== 'dss-dev-bluefield' &&
    !openshiftClusters.includes(cluster || '')
  );
};
