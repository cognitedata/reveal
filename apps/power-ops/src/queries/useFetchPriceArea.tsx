import axios from 'axios';
import {
  PriceArea,
  BidProcessResult,
  BidProcessConfiguration,
} from '@cognite/power-ops-api-types';
import { QueryClient, useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { CogniteClient } from '@cognite/sdk';
import { BidProcessResultWithData } from 'types';
import { fetchBidMatricesData } from 'utils/utils';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

const { powerOpsApiBaseUrl } = sidecar;

export const fetchProcessConfigurations = async ({
  client,
  token,
  priceAreaExternalId,
}: {
  client: CogniteClient;
  token: string;
  priceAreaExternalId: string;
}) => {
  if (!(client.project && token)) return undefined;

  const { powerOpsApiBaseUrl } = sidecar;

  const { data: processConfigurations }: { data: BidProcessConfiguration[] } =
    await axios.get(
      `${powerOpsApiBaseUrl}/${client.project}/price-area/${priceAreaExternalId}/process-configurations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  return processConfigurations;
};

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

const fetchAllPriceAreas = async (
  project: string,
  token: string
): Promise<PriceArea[]> => {
  const { data: priceAreas } = await axios.get<PriceArea[]>(
    `${powerOpsApiBaseUrl}/${project}/price-areas`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return priceAreas;
};

export const useFetchPriceAreas = () => {
  const {
    client: { project },
    authState: { token },
  } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [project, 'price-areas'],
    queryFn: () => fetchAllPriceAreas(project, token!),
    enabled: !!token,
    staleTime: Infinity, // Price Areas never update during usage of the application, unless requested
  });
};
