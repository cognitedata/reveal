import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { PROJECTS_KEY } from 'services/configs/queryKeys';
import { Source } from 'typings/interfaces';
import { CustomError } from 'services/CustomError';

const useProjectsQuery = ({
  source,
  enabled = true,
}: {
  source: Source | string | null;
  enabled: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [PROJECTS_KEY.default, source],
    ({ queryKey }) => {
      const [_key, sourceKey] = queryKey;
      // Should in theory never happened, the query is idle (due to the check in "enabled")
      if (!sourceKey) {
        return Promise.reject(
          new CustomError(
            '[Internal]: Missing source in API call to projects.',
            404
          )
        );
      }
      return api!.projects.get(sourceKey);
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

const useProjectsBusinessTagsQuery = ({
  source,
  repository,
  enabled = true,
}: {
  source: Source | string | null;
  enabled: boolean;
  repository: string;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [PROJECTS_KEY.default, PROJECTS_KEY.business_tag, source, repository],
    ({ queryKey }) => {
      const [_key, _tag, sourceKey, repositoryKey] = queryKey;
      // Should in theory never happened, the query is idle (due to the check in "enabled")
      if (!sourceKey || !repositoryKey) {
        return Promise.reject(
          new CustomError(
            '[Internal]: Missing source in API call to projects business tags',
            404
          )
        );
      }
      return api!.projects.getBusinessTags(sourceKey, repositoryKey);
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

export { useProjectsQuery, useProjectsBusinessTagsQuery };
