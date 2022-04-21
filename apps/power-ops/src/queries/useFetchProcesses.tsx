import axios from 'axios';
import { Process } from 'pages/Processes';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';

const { powerOpsApiBaseUrl } = sidecar;

const fetchProcesses = async ({
  project,
  processTypes,
  token,
}: {
  project: string;
  processTypes: string[];
  token: string | undefined;
}): Promise<Process[]> => {
  const { data: processes }: { data: Process[] } = await axios.get(
    `${powerOpsApiBaseUrl}/${project}/processes`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        type: processTypes,
      },
    }
  );
  return processes;
};

export const useFetchProcesses = ({
  project,
  processTypes,
  token,
}: {
  project: string;
  processTypes: string[];
  token: string | undefined;
}) => {
  return useQuery({
    queryKey: [processTypes].flat().join('-'),
    queryFn: () => fetchProcesses({ project, processTypes, token }),
  });
};
