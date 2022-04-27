import axios from 'axios';
import { PriceArea } from '@cognite/power-ops-api-types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';
import { CogniteClient } from '@cognite/sdk';
import { getBidMatrixData } from 'pages/BidMatrix/utils';
import { MatrixWithData, PriceAreaWithData } from 'types';

export const fetchPriceArea = async ({
  priceAreaExternalId,
  client,
  token,
}: {
  priceAreaExternalId: string;
  client: CogniteClient;
  token: string;
}) => {
  if (!(client.project && token)) return undefined;

  const { powerOpsApiBaseUrl } = sidecar;

  const { data: priceArea }: { data: PriceArea } = await axios.get(
    `${powerOpsApiBaseUrl}/${client.project}/price-area-with-data`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        priceArea: priceAreaExternalId,
      },
    }
  );
  if (!priceArea) return undefined;

  const priceAreaWithData: PriceAreaWithData = {
    ...priceArea,
    totalMatrixesWithData: await Promise.all(
      priceArea.totalMatrixes?.map(async (matrix) => {
        const data = await getBidMatrixData(client, matrix.externalId);
        if (data) {
          return {
            ...matrix,
            sequenceRows: data,
          } as MatrixWithData;
        }
        return {
          ...matrix,
        } as MatrixWithData;
      })
    ),
    plantMatrixesWithData: await Promise.all(
      priceArea.plantMatrixes.map(async (plant) => {
        return {
          ...plant,
          matrixesWithData: await Promise.all(
            plant.matrixes.map(async (matrix) => {
              const data = await getBidMatrixData(client, matrix.externalId);
              if (data) {
                return {
                  ...matrix,
                  sequenceRows: data,
                } as MatrixWithData;
              }
              return {
                ...matrix,
              } as MatrixWithData;
            })
          ),
        };
      })
    ),
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
