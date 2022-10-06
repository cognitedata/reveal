import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import sidecar from 'utils/sidecar';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';

const { snifferServiceBaseUrl } = sidecar;

const startAllSnifferJobs = (project: string, token: string) =>
  axios.get(
    `${snifferServiceBaseUrl}/${project}/jobs/start-all`,
    axiosRequestConfig(token)
  );

export const useStartAllSnifferJobs = () => {
  const { project, token } = useAuthenticatedAuthContext();
  const queryClient = useQueryClient();
  const snifferJobsKey = [project, 'sniffer-jobs'];

  return useMutation({
    mutationFn: () => startAllSnifferJobs(project, token),
    onSettled: () => {
      // When the mutation finishes, rehydrate the data to get the most recent values
      queryClient.invalidateQueries(snifferJobsKey);
    },
  });
};
