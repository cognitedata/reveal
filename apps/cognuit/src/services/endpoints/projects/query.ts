import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PROJECTS_KEY } from 'services/configs/queryKeys';
import { Project, Source } from 'typings/interfaces';
import { CustomError } from 'services/CustomError';

const useProjectsQuery = ({
  source,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  instance,
  enabled = true,
}: {
  source: Source | string | null;
  instance: string | null;
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
      // TODO(CWP-1457) Receive proper instance from method callers and call getByInstance instead
      return api!.projects.getBySource(sourceKey);
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
  project,
  enabled = true,
}: {
  project: Project | null;
  enabled: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [PROJECTS_KEY.default, project],
    ({ queryKey }) => {
      const [_key, projectKey] = queryKey as [string, Project];
      // Should in theory never happened, the query is idle (due to the check in "enabled")
      if (!projectKey) {
        return Promise.reject(
          new CustomError(
            '[Internal]: Missing project in API call to projects business tags',
            404
          )
        );
      }
      return api!.tags.getBusinessTags(projectKey);
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
