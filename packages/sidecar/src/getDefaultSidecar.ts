import { generateUrl } from './generateUrl';
import { SidecarConfig, CDFCluster } from './types';

export type Service =
  | 'discover-api'
  | 'comment-service'
  | 'user-management-service'
  | 'digital-cockpit-api';

export const services: Record<
  number,
  { name: Service; key: keyof SidecarConfig }
> = {
  8700: { name: 'discover-api', key: 'discoverApiBaseUrl' },
  8300: { name: 'comment-service', key: 'commentServiceBaseUrl' },
  8600: {
    name: 'user-management-service',
    key: 'userManagementServiceBaseUrl',
  },
  8001: { name: 'digital-cockpit-api', key: 'digitalCockpitApiBaseUrl' },
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
): Partial<SidecarConfig> => {
  const generateBaseUrls = (cluster: string, prod = false) => {
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
    }, {});

    const appsApiBaseUrl = generateUrl('https://apps-api.', prod, cluster);

    return {
      appsApiBaseUrl,
      ...serviceUrls,
      cdfApiBaseUrl: `https://${
        cluster === 'ew1' ? 'api' : cluster
      }.cognitedata.com`,
      cdfCluster: cluster === 'ew1' ? '' : cluster,
    };
  };

  return {
    ...generateBaseUrls(cluster, prod),
  };
};
