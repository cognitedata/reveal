import { useAuthenticatedAuthContext } from '@cognite/react-container';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { BidMatrixData } from 'types';
import sidecar from 'utils/sidecar';
import { axiosRequestConfig } from 'utils/utils';

const { powerOpsApiBaseUrl } = sidecar;

const fetchBidMatrix = (externalId: string, project: string, token: string) =>
  axios
    .get<BidMatrixData>(
      `${powerOpsApiBaseUrl}/${project}/sequence/bid-matrix?externalId=${externalId}`,
      axiosRequestConfig(token, {}, { Accept: 'application/json' })
    )
    .then(({ data }) => data);

export const useFetchBidMatrix = (bidMatrixExternalId: string) => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'bid-matrix', bidMatrixExternalId],
    queryFn: () => fetchBidMatrix(bidMatrixExternalId, project, token),
    enabled: !!bidMatrixExternalId,
    staleTime: Infinity,
  });
};
