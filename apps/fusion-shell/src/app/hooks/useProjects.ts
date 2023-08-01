import { useQuery } from '@tanstack/react-query';
import { getOrganization, isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { OidcService } from '@cognite/auth-react';
import { Idp, readLoginHints } from '@cognite/auth-react/src/lib/base';

const loginHints = readLoginHints();

type ProjectList = {
  items: { urlName: string }[];
};

type TokenInspect = {
  projects: { projectUrlName: string; groups: unknown[] }[];
};

const _fetchProjects = async (cluster: string, accessToken: string) => {
  const url = new URL(`https://${cluster}/api/v1/projects`);
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
  });
  try {
    const response = await fetch(url, { headers });

    if (response.ok) {
      const json: ProjectList = await response.json();
      return json?.items?.map((project) => project.urlName) ?? [];
    }

    return Promise.reject(new Error('Failed to fetch projects'));
  } catch (error: unknown) {
    return Promise.reject(new Error('Failed to fetch projects'));
  }
};

const _fetchTokenInspect = async (cluster: string, accessToken: string) => {
  const url = new URL(`https://${cluster}/api/v1/token/inspect`);
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
  });
  const response = await fetch(url, { headers });
  if (response.ok) {
    const json: TokenInspect = await response.json();
    const projectsWithGroups = json?.projects.filter(
      (project) => project.groups.length > 0
    );
    return projectsWithGroups.map((project) => project.projectUrlName);
  }

  return Promise.reject(new Error('Failed to inspect token'));
};

const fetchProjects = async (
  cluster: string,
  accessToken?: string
): Promise<string[]> => {
  if (accessToken) {
    const [projects, tokens] = await Promise.all([
      _fetchProjects(cluster, accessToken),
      _fetchTokenInspect(cluster, accessToken),
    ]);

    return Array.from(new Set(projects.concat(tokens))).sort();
  }
  return [];
};

export const useProjects = (cluster: string, idp: Idp) => {
  return useQuery(
    ['clusters-projects', cluster],
    async () => {
      const organization = getOrganization() ?? loginHints?.organization;
      const service = new OidcService(idp, organization, cluster);
      const accessToken = await service.acquireTokenSilent(cluster);
      const _projects = await fetchProjects(cluster, accessToken);
      return _projects;
    },
    {
      enabled: isUsingUnifiedSignin(),
    }
  );
};
