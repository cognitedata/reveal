import axios from 'axios';
import { PriceArea } from '@cognite/power-ops-api-types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';

const fetchPriceAreas = async ({
  project,
  token,
}: {
  project: string | undefined;
  token: string | undefined;
}) => {
  if (!(project && token)) return undefined;

  const { powerOpsApiBaseUrl } = sidecar;

  const { data: matrixes }: { data: PriceArea[] } = await axios.get(
    `${powerOpsApiBaseUrl}/${project}/matrixes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return matrixes;
};

export const useFetchPriceAreas = ({
  project,
  token,
}: {
  project: string | undefined;
  token: string | undefined;
}) => {
  return useQuery({
    queryKey: `${project}_priceAreas`,
    queryFn: () => fetchPriceAreas({ project, token }),
  });
};
