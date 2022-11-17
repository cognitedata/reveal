import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { RkomBid, RkomFilterType } from '@cognite/power-ops-api-types';
import { axiosRequestConfig } from 'utils/utils';
import sidecar from 'utils/sidecar';
import dayjs from 'dayjs';

const { powerOpsApiBaseUrl } = sidecar;

const fetchRKOMBids = (
  project: string,
  token: string,
  filter: RkomFilterType
) =>
  axios
    .get<RkomBid[]>(
      `${powerOpsApiBaseUrl}/${project}/rkom-bids`,
      axiosRequestConfig(token, { params: filter })
    )
    .then(({ data }) => data);

export const useFetchRKOMBids = (filter?: RkomFilterType) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'rkomBids', filter],
    queryFn: () =>
      fetchRKOMBids(project, token, {
        ...filter!,
        endDate: dayjs(filter!.startDate, 'YYYY-MM-DD')
          .endOf('week')
          .format('YYYY-MM-DD'),
      }),
    enabled: !!filter,
  });
};
