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

  const client = authClient?.getClient();

  if (!client) {
    // eslint-disable-next-line no-console
    console.error('Missing SDK client.');
    return Promise.resolve([]);
  }

  const result = await client.get('/api/v1/projects');
  return result?.data?.items;
};

export default fetchProjects;
