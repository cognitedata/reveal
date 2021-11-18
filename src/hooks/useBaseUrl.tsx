import { useUserContext } from '@cognite/cdf-utilities';
import { useBaseParams } from './useParams';

export const useBaseUrl = () => {
  const { project } = useBaseParams();
  const user = useUserContext();

  const baseUrl = `/${project || user.project}/documents`;
  return baseUrl;
};
