import axios from 'axios';
import { PriceArea, BidProcessResult } from '@cognite/power-ops-api-types';
import { QueryClient, useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { CogniteClient } from '@cognite/sdk';
import { BidProcessResultWithData } from 'types';
import { axiosRequestConfig, fetchBidMatricesData } from 'utils/utils';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

const getMatrixDataFromCache = async (
  matrixExternalId: string,
  queryClient: QueryClient,
  project: string,
  token: string
) => {
  const queryData:
    | { dataRows: Array<number[]>; columnHeaders: Array<number | string> }
    | undefined = queryClient.getQueryData(matrixExternalId);

  if (!queryData) {
    const { data: serverData } = await fetchBidMatricesData(
      [matrixExternalId],
      project,
      token,
      'json'
    );
    const formattedData = {
      dataRows: serverData.dataRows,
      columnHeaders: serverData.headerRow,
    };

    queryClient.setQueryData<{
      dataRows: Array<number[]>;
      columnHeaders: Array<number | string>;
    }>(matrixExternalId, formattedData);

    return formattedData;
  }

  return queryData;
};

export const fetchBidProcessResultWithData = async ({
  client,
  queryClient,
  token,
  priceAreaExternalId,
  bidProcessEventExternalId,
}: {
  client: CogniteClient;
  queryClient: QueryClient;
  token: string;
  priceAreaExternalId: string;
  bidProcessEventExternalId?: string;
}): Promise<BidProcessResultWithData | undefined> => {
  if (!(client.project && token)) return undefined;

  const { powerOpsApiBaseUrl } = sidecar;

  const url = `${powerOpsApiBaseUrl}/${client.project}/price-area/${priceAreaExternalId}/data`;

  const { data: bidProcessResult }: { data: BidProcessResult } =
    await axios.get(
      url + (bidProcessEventExternalId ? `/${bidProcessEventExternalId}` : ''),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  if (!bidProcessResult) return undefined;

  const totalMatrixData = await getMatrixDataFromCache(
    bidProcessResult.totalMatrix!.externalId,
    queryClient,
    client.project,
    token
  );
  const bidProcessResultWithData: BidProcessResultWithData = {
    ...bidProcessResult,
    totalMatrixWithData: {
      ...bidProcessResult.totalMatrix!,
      ...totalMatrixData,
    },
    plantMatrixesWithData: bidProcessResult.plantMatrixes
      ? await Promise.all(
          bidProcessResult.plantMatrixes.map(async (plant) => {
            const plantMatrixData = await getMatrixDataFromCache(
              plant.matrix!.externalId,
              queryClient,
              client.project,
              token
            );
            return {
              ...plant,
              matrixWithData: {
                ...plant.matrix!,
                ...plantMatrixData,
              },
            };
          })
        )
      : [],
  };
  return bidProcessResultWithData;
};

const fetchPriceAreas = (project: string, token: string) =>
  axios
    .get<PriceArea[]>(
      `${powerOpsApiBaseUrl}/${project}/price-areas`,
      axiosRequestConfig(token)
    )
    .then(({ data }) => data);

export const useFetchPriceAreas = () => {
  const { project, token } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'price-areas'],
    queryFn: () => fetchPriceAreas(project, token),
    enabled: Boolean(project && token),
    staleTime: Infinity,
  });
};
