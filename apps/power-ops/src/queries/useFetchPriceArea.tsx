import axios from 'axios';
import {
  PriceArea,
  BidProcessConfiguration,
} from '@cognite/power-ops-api-types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { CogniteClient } from '@cognite/sdk';
import { getBidMatrixData } from 'components/BidMatrix/utils';
import { PriceAreaWithData } from 'types';

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

export const fetchPriceArea = async ({
  client,
  token,
  priceAreaExternalId,
  bidProcessEventExternalId,
}: {
  client: CogniteClient;
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

  const priceAreaWithData: PriceAreaWithData = {
    ...priceArea,
    totalMatrixWithData: {
      ...priceArea.totalMatrix!,
      sequenceRows:
        (await getBidMatrixData(client, priceArea.totalMatrix?.externalId)) ||
        [],
    },
    plantMatrixesWithData: priceArea.plantMatrixes
      ? await Promise.all(
          priceArea.plantMatrixes.map(async (plant) => {
            const matrixData = await getBidMatrixData(
              client,
              plant.matrix?.externalId
            );
            return {
              ...plant,
              matrixWithData: {
                ...plant.matrix!,
                sequenceRows: matrixData || [],
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
