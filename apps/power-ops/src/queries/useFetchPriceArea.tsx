import axios from 'axios';
import {
  PriceArea,
  BidProcessConfiguration,
} from '@cognite/power-ops-api-types';
import { QueryClient, useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { CogniteClient } from '@cognite/sdk';
import { PriceAreaWithData } from 'types';
import { fetchBidMatricesData } from 'utils/utils';

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

export const fetchPriceArea = async ({
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
}) => {
  if (!(client.project && token)) return undefined;

  const { powerOpsApiBaseUrl } = sidecar;

  const url = `${powerOpsApiBaseUrl}/${client.project}/price-area/${priceAreaExternalId}/data`;

  const { data: priceArea }: { data: PriceArea } = await axios.get(
    url + (bidProcessEventExternalId ? `/${bidProcessEventExternalId}` : ''),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!priceArea) return undefined;

  const totalMatrixData = await getMatrixDataFromCache(
    priceArea.totalMatrix!.externalId,
    queryClient,
    client.project,
    token
  );
  const priceAreaWithData: PriceAreaWithData = {
    ...priceArea,
    totalMatrixWithData: {
      ...priceArea.totalMatrix!,
      ...totalMatrixData,
    },
    plantMatrixesWithData: priceArea.plantMatrixes
      ? await Promise.all(
          priceArea.plantMatrixes.map(async (plant) => {
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
  return priceAreaWithData;
};

const fetchAllPriceAreas = async ({
  client,
  token,
}: {
  client: CogniteClient;
  token: string;
}) => {
  if (!(client.project && token)) return undefined;

  const { powerOpsApiBaseUrl } = sidecar;

  const { data: priceAreas }: { data: PriceArea[] } = await axios.get(
    `${powerOpsApiBaseUrl}/${client.project}/price-areas`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return priceAreas;
};

export const useFetchAllPriceAreas = ({
  client,
  token,
}: {
  client: CogniteClient;
  token: string;
}) => {
  return useQuery({
    queryKey: `${client.project}_priceAreas`,
    queryFn: () => fetchAllPriceAreas({ client, token }),
  });
};
