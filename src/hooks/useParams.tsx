import { useParams } from 'react-router-dom';

export const useClassifierParams = () => {
  const { classifierName } = useParams<{ classifierName: string }>();

  return { classifierName: decodeURIComponent(classifierName) };
};

export const useLabelParams = () => {
  const { externalId } = useParams<{ externalId: string }>();

  return decodeURIComponent(externalId);
};

export const useBaseParams = () => {
  return useParams<{ project: string }>();
};
