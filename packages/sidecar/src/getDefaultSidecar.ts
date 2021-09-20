import { SidecarConfig, CDFCluster } from './types';

interface Props {
  prod: boolean;
  cluster: CDFCluster;
  localComments?: boolean;
  localUserManagement?: boolean;
  localDigitalCockpit?: boolean;
}
export const getDefaultSidecar = (
  {
    prod,
    cluster,
    localComments,
    localUserManagement,
    localDigitalCockpit,
  }: Props = { prod: false, cluster: 'azure-dev' }
): Partial<SidecarConfig> => {
  const generateBaseUrls = (cluster: string, prod = false) => {
    const generateUrl = (
      base: string,
      prod: boolean,
      cluster: string,
      local?: false | string
    ) => {
      if (local) {
        return `http://localhost:${local}`;
      }

      return [
        base,
        !prod && 'staging.',
        cluster !== 'ew1' && `${cluster}.`,
        'cognite.ai',
      ]
        .filter(Boolean)
        .join('');
    };

    const commentServiceBaseUrl = generateUrl(
      'https://comment-service.',
      prod,
      cluster,
      localComments && '8300'
    );
    const userManagementServiceBaseUrl = generateUrl(
      'https://user-management-service.',
      prod,
      cluster,
      localUserManagement && '8600'
    );
    const digitalCockpitApiBaseUrl = generateUrl(
      'https://digital-cockpit-api.',
      prod,
      cluster,
      localDigitalCockpit && '8001'
    );
    const appsApiBaseUrl = generateUrl('https://apps-api.', prod, cluster);

    return {
      appsApiBaseUrl,
      cdfApiBaseUrl: `https://${
        cluster === 'ew1' ? 'api' : cluster
      }.cognitedata.com`,
      commentServiceBaseUrl,
      userManagementServiceBaseUrl,
      digitalCockpitApiBaseUrl,
      cdfCluster: cluster === 'ew1' ? '' : cluster,
    };
  };

  return {
    ...generateBaseUrls(cluster, prod),
  };
};
