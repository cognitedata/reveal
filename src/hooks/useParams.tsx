import { useParams } from 'react-router-dom';

export const useClassifierParams = () => {
  const { classifierName } = useParams<{ classifierName: string }>();

  if (classifierName === undefined) {
    throw new Error('classifierName parameter is not set');
  }

  return { classifierName: decodeURIComponent(classifierName) };
};

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
