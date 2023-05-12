import { createLink, getProject } from '@cognite/cdf-utilities';

export const createCdfLink = (
  path: string,
  cluster?: string,
  searchParams?: URLSearchParams
) => {
  const project = getProject();
  const pathNameWithoutProject = window.location.pathname.replace(
    `/${project}`,
    ''
  );

  // simconfig app path without project name
  const appPath = path.startsWith('/')
    ? `/simint/${path}`
    : `${pathNameWithoutProject}/${path}`;

  const queryString = window.location.search;

  if (cluster && !queryString.includes('cluster')) {
    const parseCluster = cluster.startsWith('https')
      ? cluster.replace('https://', '')
      : cluster;

    const qs = new URLSearchParams({
      cluster: parseCluster,
    }).toString();

    return createLink(
      `${appPath}?${qs}${searchParams?.toString() ?? ''}`
    ).replace(/\s+/g, '');
  }

  // Let's get the cdfLink with cluster and env(is not mandatory) part of query param
  const cdfLink = createLink(`${appPath}`).replace(/\s+/g, '');

  // When there no app level search params, just return the cdfLink which will contain cluster and env
  if (!searchParams) {
    return cdfLink;
  }

  // Append with & app's searchParams
  return `${cdfLink}&${searchParams.toString()}`.replace(/\s+/g, '');
};
