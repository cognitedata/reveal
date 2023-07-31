import { TokenInspect } from '../types';
import { getSdk } from '../hooks/useLoginWithAzure';

const getProjects = async () => {
  const sdk = getSdk();
  const result = await sdk.get<TokenInspect>('/api/v1/token/inspect');

  const projects = result!.data?.projects
    ?.filter((p) => p.groups.length > 0)
    .map((p: { projectUrlName: string }) => p.projectUrlName);

  return projects;
};

export default getProjects;
