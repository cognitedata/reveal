import { generateUrl } from './generateUrl';
import { CDFCluster, ApiBaseUrls } from './types';

export type Service =
  | 'comment-service'
  | 'digital-cockpit-api'
  | 'discover-api'
  | 'fake-idp'
  | 'frontend-metrics'
  | 'infield-api'
  | 'infield-cache-api'
  | 'power-ops-api'
  | 'simconfig-api'
  | 'sniffer-service'
  | 'user-management-service';

type LocalServices = Omit<ApiBaseUrls, 'appsApiBaseUrl' | 'cdfApiBaseUrl'>;

export const services: Record<
  number,
  { name: Service; key: keyof LocalServices }
> = {
  8001: { name: 'digital-cockpit-api', key: 'digitalCockpitApiBaseUrl' },
  8011: { name: 'infield-api', key: 'infieldApiBaseUrl' },
  8015: { name: 'infield-cache-api', key: 'infieldCacheApiBaseUrl' },
  8200: { name: 'fake-idp', key: 'fakeIdpBaseUrl' },
  8300: { name: 'comment-service', key: 'commentServiceBaseUrl' },
  8600: {
    name: 'user-management-service',
    key: 'userManagementServiceBaseUrl',
  },
  8700: { name: 'discover-api', key: 'discoverApiBaseUrl' },
  8800: { name: 'simconfig-api', key: 'simconfigApiBaseUrl' },
  8805: { name: 'power-ops-api', key: 'powerOpsApiBaseUrl' },
  8810: { name: 'sniffer-service', key: 'snifferServiceBaseUrl' },
  8900: { name: 'frontend-metrics', key: 'frontendMetricsBaseUrl' },
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
