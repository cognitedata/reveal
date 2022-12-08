import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { axiosRequestConfig } from 'utils/utils';
import sidecar from 'utils/sidecar';
import {
  BenchmarkingFiltersQueryType,
  BenchmarkingFilters,
} from '@cognite/power-ops-api-types';

const { powerOpsApiBaseUrl } = sidecar;

const fetchBenchmarkingFilters = (
  project: string,
  token: string,
  query: BenchmarkingFiltersQueryType
) =>
  axios
    .get<BenchmarkingFilters>(
      `${powerOpsApiBaseUrl}/${project}/benchmarking-filters`,
      axiosRequestConfig(token, { params: query })
    )
    .then(({ data }) => data);

export const useFetchBenchmarkingFilters = (
  query?: BenchmarkingFiltersQueryType
) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'methodPerformance', query],
    queryFn: () => fetchBenchmarkingFilters(project, token, query!),
    enabled: !!query,
  });
};
