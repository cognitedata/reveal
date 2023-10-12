import { NavigateFunction } from 'react-router-dom';

import { ProjectList, TokenInspect } from '../types';

// we export this function for testing purposes only
export function generateRedirectToLoginUrl(href: string) {
  const url = new URL(href);
  const ref = new URLSearchParams({
    path: url.pathname,
    search: url.search,
  });
  const redirectUrl = new URL('/', url.origin);
  redirectUrl.search = ref.toString();
  return redirectUrl.href;
}

/**
 * Used to redirect to login page if user does not have access to project
 * And forwards the current path and search params to the login page
 */
export function redirectToLogin() {
  const redirectUrl = generateRedirectToLoginUrl(window.location.href);
  redirectToSubpath(redirectUrl);
}

export const parseRef = (search: string): [string, Record<string, string>] => {
  const searchParams = new URLSearchParams(search);

  const refPath = searchParams.get('path') ?? '';
  const refSearch = searchParams.get('search') ?? '';
  const extraParams: Record<string, string> = {};

  new URLSearchParams(refSearch).forEach((value, key) => {
    extraParams[key] = value;
  });

  return [refPath, extraParams];
};

export const selectProjectRoute = '/select-project';
export const goToSelectProject = (navigate: NavigateFunction) => {
  const [path, extraParams] = parseRef(window.location.search);
  if (path && Object.keys(extraParams).length > 0) {
    redirectToApp(path, extraParams);
    return;
  }
  navigate(selectProjectRoute);
};

export const redirectToSubpath = (url: string) => {
  const { host, protocol, origin } = window.location;
  const redirectUrl = new URL(url, origin);
  // make sure we don't redirect to antoher domain as we don't trust the input path
  // see https://kennel209.gitbooks.io/owasp-testing-guide-v4/content/en/web_application_security_testing/testing_for_client_side_url_redirect_otg-client-004.html
  redirectUrl.host = host;
  redirectUrl.protocol = protocol;
  window.location.href = redirectUrl.href;
};

export const redirectToApp = (
  path: string,
  extraParams: Record<string, string> = {}
) => {
  const urlSearchParams = new URLSearchParams(extraParams);
  redirectToSubpath(`${path}?${urlSearchParams.toString()}`);
};

export const parseEnvFromCluster = (cluster: string) => {
  const clusterWithoutPrefix = cluster.replace(/^https?:\/\//, '');
  const splits = clusterWithoutPrefix.split('.');
  const env = splits[0];

  return env === 'api' ? '' : env;
};

const clusterNames: Record<string, string> = {
  '': 'Europe 1 (Google)',
  api: 'Europe 1 (Google)',
  'europe-west1-1': 'Europe 1 (Google)',
  'westeurope-1': 'Europe 2 (Microsoft)',
  'asia-northeast1-1': 'Asia 1 (Google)',
  'az-tyo-gp-001': 'Asia 2 (Microsoft)',
  'az-eastus-1': 'US East 1',
  'az-ams-aloe': 'Aloe',
  'bp-northeurope': 'BP North Europe',
  omv: 'OMV',
  pgs: 'PGS',
  'power-no': 'Power NO (Google)',
  'az-power-no-northeurope': 'Power NO (Microsoft)',
  statnett: 'Statnett',
};

export const parseEnvLabelFromCluster = (cluster: string) => {
  const clusterWithoutPrefix = cluster.replace(/^https?:\/\//, '');
  const splits = clusterWithoutPrefix.split('.');
  const env = splits[0];

  return clusterNames?.[env] || env;
};

export const inspectTokenGetProjects = async (
  cluster: string,
  accessToken: string
) => {
  const inspect: TokenInspect = await fetch(
    `https://${cluster}/api/v1/token/inspect`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((r) =>
    r.status === 200 ? r.json() : Promise.reject({ status: r.status })
  );

  return inspect.projects
    .filter((p) => p.groups.length > 0)
    .map((p) => p.projectUrlName);
};

/**
 * This will call both the /projects api and /token/inspect and return the union because:
 * 1. /projects could return projects not in token/inspect via indirect access (think of a project hiarchy)
 * 2. /token/inspect will return projects that a token have access to, but do not have project:list cabability
 */
export const getProjects = async (
  cluster: string,
  accessToken: string
): Promise<string[]> => {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const [projectList, tokenList] = await Promise.all([
    fetch(`https://${cluster}/api/v1/projects`, options)
      .then(async (r) => {
        if (r.status === 200) {
          const data: ProjectList = await r.json();
          return data?.items?.map((i) => i.urlName);
        } else {
          return [] as string[];
        }
      })
      .catch(() => [] as string[]),
    fetch(`https://${cluster}/api/v1/token/inspect`, options).then(
      async (r) => {
        if (r.status === 200) {
          const data: TokenInspect = await r.json();
          return data.projects
            .filter((p) => p.groups.length > 0)
            .map((p_1) => p_1.projectUrlName);
        } else {
          return Promise.reject({ status: r.status });
        }
      }
    ),
  ]);

  return Array.from(new Set(projectList.concat(tokenList))).sort();
};
