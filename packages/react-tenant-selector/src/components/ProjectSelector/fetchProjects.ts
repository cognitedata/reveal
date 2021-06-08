import { CogniteAuth } from '@cognite/auth-utils';

export const fetchProjects = async ({
  authClient,
  enabled,
}: {
  authClient?: CogniteAuth;
  enabled?: boolean;
}) => {
  if (!enabled) {
    return Promise.resolve([]);
  }

  return authClient?.getProjects();
};

export default fetchProjects;
