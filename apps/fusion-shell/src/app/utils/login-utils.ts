import sdk, { getFlow, getIDP, getToken } from '@cognite/cdf-sdk-singleton';
import { getCluster, getProject } from '@cognite/cdf-utilities';
import { IDPType, getProjects } from '@cognite/login-utils';

/**
 * Used to redirect to login page if user does not have access to project
 * And forwards the current path and search params to the login page
 */
function redirectToLogin() {
  const ref = new URLSearchParams();

  const path = window.location.pathname.split('/').slice(2).join('/');
  if (path) {
    ref.append('path', path);
  }

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.forEach((_, key) => {
    if (key === 'env' || key === 'cluster') {
      searchParams.delete(key);
    }
  });
  const search = searchParams.toString();
  if (search) {
    ref.append('search', search);
  }

  const redirectPath = path || search ? `/?${ref.toString()}` : '/';

  // if the url is the same and we are already on the login page, don't redirect
  if (
    window.location.pathname + window.location.search ===
      `${path}/?${ref.toString()}` ||
    window.location.pathname === '/'
  ) {
    return;
  }
  window.location.href = redirectPath;
}

/**
 *
 * Check if used has access to project
 */
export const checkIfUserHasAccessToProject = async (projectName: string) => {
  const project = getProject();

  // If auth token is provided from test environment, skip check
  if (window?.testAuthOverrides) {
    return;
  }

  if (window.location.pathname === '/') {
    // eslint-disable-next-line no-console
    console.info('Login page, skipping check if user has access to project');
    return;
  }

  if (!project && window.location.pathname !== '/') {
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
        getProjects(cluster, await getToken()).then((projects) => {
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
