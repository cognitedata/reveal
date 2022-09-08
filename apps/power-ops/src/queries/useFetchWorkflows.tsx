import axios from 'axios';
import { Workflow } from 'types';
import { useQuery } from 'react-query';
import sidecar from 'utils/sidecar';

const { powerOpsApiBaseUrl } = sidecar;

const fetchWorkflows = async ({
  project,
  token,
}: {
  project: string;
  token: string | undefined;
}): Promise<Workflow[]> => {
  const { data: workflows }: { data: Workflow[] } = await axios.get(
    `${powerOpsApiBaseUrl}/${project}/processes`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return workflows;
};

export const useFetchWorkflows = ({
  project,
  token,
}: {
  project: string;
  token: string | undefined;
}) => {
  return useQuery({
    queryKey: `workflows_${project}`,
    queryFn: () => fetchWorkflows({ project, token }),
  });
};
