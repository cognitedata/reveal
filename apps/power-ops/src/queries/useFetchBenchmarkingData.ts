import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';
import sidecar from 'utils/sidecar';
import {
  BenchmarkingFilterType,
  BenchmarkingData,
} from '@cognite/power-ops-api-types';

const { powerOpsApiBaseUrl } = sidecar;

const fetchBenchmarkingSequences = (
  project: string,
  token: string,
  filter: BenchmarkingFilterType
) =>
  axios
    .get<BenchmarkingData[]>(
      `${powerOpsApiBaseUrl}/${project}/benchmarking-data`,
      axiosRequestConfig(token, { params: filter })
    )
    .then(({ data }) => data);

export const useFetchBenchmarkingSequences = (
  filter?: BenchmarkingFilterType
) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'methodPerformance', filter],
    queryFn: () => fetchBenchmarkingSequences(project, token, filter!),
    enabled: !!filter,
  });
};
