const CLUSTER_KEY = 'cluster';

type Vendor = 'AKS' | 'GKE' | 'OPENSHIFT';
export const clusters: { [key in Vendor]: string[] } = {
  AKS: [
    'az-ams-aloe',
    'az-eastus-1',
    'az-power-no-northeurope',
    'azure-dev',
    'bluefield',
    'bp-northeurope',
    'westeurope-1',
  ],
  GKE: [
    'europe-west1-1',
    'greenfield',
    'omv',
    'statnett',
    'power-no',
    'pgs',
    'asia-northeast1-1',
  ],
  OPENSHIFT: ['sapc-01', 'openfield', 'okd-dev-01', 'okd-dbre-01'],
};

export const isProduction = () =>
  window?.location?.hostname === 'fusion.cognite.com';
export const isStaging = () =>
  window?.location?.hostname === 'staging.fusion.cognite.com';

export const getCluster = (): string | undefined => {
  const apiUrl = new URLSearchParams(window?.location?.search).get(CLUSTER_KEY);
  const cluster = apiUrl?.split('.')[0];
  return cluster === 'api' ? 'europe-west1-1' : cluster;
};

export const getVendor = (): Vendor | undefined => {
  const cluster = getCluster();
  if (!cluster) {
    return undefined;
  }

  return Object.keys(clusters).find(vendor =>
    clusters[vendor as Vendor].includes(cluster)
  ) as Vendor;
};

export const isVendorGKE = (): boolean => {
  return getVendor() === 'GKE';
};
