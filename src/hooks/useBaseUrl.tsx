import { useUserContext } from '@cognite/cdf-utilities';
import { useBaseParams } from './useParams';

export const useProjectUrl = () => {
  const { project } = useBaseParams();
  const user = useUserContext();

  return `${project || user.project}`;
};

export const useBaseUrl = () => {
  const projectUrl = useProjectUrl();
  return `/${projectUrl}/documents`;
};
