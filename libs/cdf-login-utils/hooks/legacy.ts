import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useLegacyProject = (
  cluster: string,
  projectName: string,
  options?: UseQueryOptions<boolean, Error, boolean, string[]>
) => {
  return useQuery<boolean, Error, boolean, string[]>(
    ['legacy-project', cluster, projectName],
    async () => {
      const queryParams = new URLSearchParams({
        app: 'cdf',
        project: projectName,
        redirectUrl: window.location.origin,
      });

      return fetch(`https://${cluster}/login/redirect?${queryParams}`, {
        redirect: 'manual',
      }).then((response) => {
        const { status, type } = response;

        if (type === 'opaqueredirect') {
          return true;
        }

        if (status === 400) {
          throw new Error('Redirect URL is not whitelisted');
        } else {
          throw new Error('An error has occurred');
        }
      });
    },
    {
      ...options,
    }
  );
};
