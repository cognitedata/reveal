import { generateUrl } from './generateUrl';
import { CDFCluster, ApiBaseUrls } from './types';

export type Service =
  | 'discover-api'
  | 'comment-service'
  | 'user-management-service'
  | 'digital-cockpit-api'
  | 'infield-api'
  | 'infield-cache-api'
  | 'simconfig-api'
  | 'power-ops-api'
  | 'sniffer-service'
  | 'fake-idp';

type LocalServices = Omit<ApiBaseUrls, 'appsApiBaseUrl' | 'cdfApiBaseUrl'>;

export const services: Record<
  number,
  { name: Service; key: keyof LocalServices }
> = {
  8700: { name: 'discover-api', key: 'discoverApiBaseUrl' },
  8300: { name: 'comment-service', key: 'commentServiceBaseUrl' },
  8600: {
    name: 'user-management-service',
    key: 'userManagementServiceBaseUrl',
  },
  8001: { name: 'digital-cockpit-api', key: 'digitalCockpitApiBaseUrl' },
  8011: { name: 'infield-api', key: 'infieldApiBaseUrl' },
  8015: { name: 'infield-cache-api', key: 'infieldCacheApiBaseUrl' },
  8800: { name: 'simconfig-api', key: 'simconfigApiBaseUrl' },
  8200: { name: 'fake-idp', key: 'fakeIdpBaseUrl' },
  8805: { name: 'power-ops-api', key: 'powerOpsApiBaseUrl' },
  8810: { name: 'sniffer-service', key: 'snifferServiceBaseUrl' },
};

const getPort = (name: Service) => {
  return Object.keys(services)?.reduce((result, port) => {
    const service = services[Number(port)];
    if (service.name === name) {
      return Number(port);
    }

    return result;
  }, undefined as undefined | number);
};

interface Props {
  prod: boolean;
  cluster: CDFCluster;
  localServices?: Service[];
}
export const getDefaultSidecar = (
  { prod, cluster, localServices }: Props = {
    prod: false,
    cluster: 'azure-dev',
    localServices: [],
  }
): ApiBaseUrls & { cdfCluster: string } => {
  const generateBaseUrls = (cluster: string, prod = false): ApiBaseUrls => {
    const serviceUrls = Object.keys(services)?.reduce((result, port) => {
      const service = services[Number(port)];
      let localService: any =
        (localServices || []).includes(service.name) && getPort(service.name);

      if (localService) {
        localService = `${localService}`;
      }

      const url = generateUrl(
        `https://${service.name}.`,
        prod,
        cluster,
        localService
      );

      return { ...result, [service.key]: url };
    }, {} as Record<keyof LocalServices, string>);

    const appsApiBaseUrl = generateUrl('https://apps-api.', prod, cluster);

    return {
      appsApiBaseUrl,
      ...serviceUrls,
      cdfApiBaseUrl: `https://${
        cluster === 'ew1' ? 'api' : cluster
      }.cognitedata.com`,
    };
  };

  return {
    ...generateBaseUrls(cluster, prod),
    cdfCluster: cluster === 'ew1' ? '' : cluster,
  };
};
