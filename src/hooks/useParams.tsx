import { useParams } from 'react-router-dom';

export const useLabelParams = () => {
  const { externalId } = useParams<{ externalId: string }>();

  if (externalId === undefined) {
    throw new Error('externalId parameter is not set');
  }

  return decodeURIComponent(externalId);
};

export const useBaseParams = () => {
  return useParams<{ project: string }>();
};
