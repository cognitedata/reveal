import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { PROJECTS_KEY } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';

const useProjectsQuery = ({
  source,
  enabled = true,
  key,
}: {
  key: 'source' | 'target' | string;
  source: string | null;
  enabled: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    source ? [PROJECTS_KEY.default, key, source] : PROJECTS_KEY.default,
    async () => {
      // Should in theory never happened, the query is idle (due to the check in "enabled")
      if (!source) {
        return Promise.reject(
          new CustomError(
            '[Internal]: Missing source in API call to projects.',
            404
          )
        );
      }
      return api!.projects.get(source!);
    },
    {
      enabled: enabled && isValid,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

export { useProjectsQuery };
