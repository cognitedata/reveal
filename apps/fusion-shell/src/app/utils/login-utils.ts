import sdk, { getFlow, getIDP, getToken } from '@cognite/cdf-sdk-singleton';
import { getCluster } from '@cognite/cdf-utilities';
import { IDPType, getProjects, redirectToLogin } from '@cognite/login-utils';

/**
 *
 * Check if used has access to project
 */
export const checkIfUserHasAccessToProject = async (projectName: string) => {
  // cyToken is set in cypress tests
  const cyToken = localStorage.getItem('CY_TOKEN');
  if (cyToken) {
    return;
  }

  if (projectName === '') {
    // eslint-disable-next-line no-console
    console.warn(
      'Project is not set, cannot check if user has access to project'
    );
    redirectToLogin();
    return;
  }

  const { flow } = getFlow() as { flow: IDPType | undefined };
  switch (flow) {
    case undefined:
      redirectToLogin();
      break;
    case 'AAD_B2C':
    case 'ADFS2016':
    case 'AUTH0':
    case 'COGNITE_IDP':
    case 'AZURE_AD': {
      const urlCluster = getCluster();
      const clusters = urlCluster
        ? undefined
        : await (async () => {
            try {
              const idp = await getIDP();
              if (idp?.type !== 'COGNITE_AUTH') {
                return idp.clusters;
              }
            } catch {
              return undefined;
            }
          })();
      // default to domain service cluster, of there is only one cluster
      const cluster =
        urlCluster || (clusters?.length === 1 ? clusters?.[0] : undefined);
      if (!cluster) {
        redirectToLogin();
      } else {
        const token = await getToken();
        getProjects(cluster, token).then((projects) => {
          if (!projects.some((p) => p === projectName)) {
            redirectToLogin();
          }
        });
      }
      break;
    }
    case 'COGNITE_AUTH':
      try {
        const loggedIn = await sdk
          .get<{ data: { loggedIn: boolean } }>('/login/status')
          .then((r) => r.data?.data?.loggedIn);
        if (!loggedIn) {
          redirectToLogin();
        }
      } catch {
        redirectToLogin();
      }
      break;
    default:
      break;
  }
};
