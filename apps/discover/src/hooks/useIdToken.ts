import { getFlow } from '@cognite/auth-utils';
import { getTenantInfo } from '@cognite/react-container';

export const useIdToken = (useIdToken: boolean) => {
  const [project] = getTenantInfo();
  const { flow } = getFlow(project);

  return useIdToken && flow !== 'COGNITE_AUTH';
};
