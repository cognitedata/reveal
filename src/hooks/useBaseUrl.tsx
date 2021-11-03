import { useUserContext } from '@cognite/cdf-utilities';
import { useParams } from 'react-router-dom';

export const useBaseUrl = () => {
  const { project } = useParams<{ project: string }>();
  const user = useUserContext();

  const baseUrl = `/${project || user.project}/documents`;
  return baseUrl;
};
