import { BidProcessResult } from '@cognite/power-ops-api-types';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import sidecar from 'utils/sidecar';
import { axiosRequestConfig } from 'utils/utils';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const fetchBidProcessResult = (
  project: string,
  token: string,
  priceAreaExternalId: string,
  bidProcessEventExternalId: string
) =>
  axios
    .get<BidProcessResult>(
      `${powerOpsApiBaseUrl}/${project}/price-area/${priceAreaExternalId}/data/${bidProcessEventExternalId}`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchBidProcessResult = (
  priceAreaExternalId: string,
  bidProcessEventExternalId: string
) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [
      project,
      'bid-process-result',
      priceAreaExternalId,
      bidProcessEventExternalId,
    ],
    queryFn: () =>
      fetchBidProcessResult(
        project,
        token,
        priceAreaExternalId,
        bidProcessEventExternalId
      ),
    enabled: Boolean(priceAreaExternalId && bidProcessEventExternalId),
  });
};
