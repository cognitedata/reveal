import { ProjectList, TokenInspect } from '../types';

export const redirectToApp = (
  projectName: string,
  env: string,
  cluster: string,
  extraParams: Record<string, string> = {}
) => {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append('env', env);
  urlSearchParams.append('cluster', cluster);

  Object.keys(extraParams).forEach((key) => {
    urlSearchParams.append(key, extraParams[key]);
  });

  window.location.href = `/${projectName}?${urlSearchParams.toString()}`;
};

export const redirectToLogin = () => {
  const path = encodeURIComponent(
    window.location.pathname.split('/').slice(2).join('/')
  );
  window.location.href = path ? `/?ref=${path}` : '/';
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
