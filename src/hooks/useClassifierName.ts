import { useDocumentsPipelinesQuery } from 'src/services/query/pipelines/query';

export const useClassifierName = () => {
  const { data: pipeline } = useDocumentsPipelinesQuery();

  return { classifierName: pipeline?.classifier?.name ?? 'No name' };
};
