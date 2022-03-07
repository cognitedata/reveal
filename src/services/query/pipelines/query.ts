import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { PIPELINES_KEYS } from 'src/services/constants';
import { fetchDocumentPipelines } from 'src/services/api';

export const useDocumentsPipelinesQuery = () => {
  const sdk = useSDK();

  return useQuery(PIPELINES_KEYS.pipelines(), () =>
    fetchDocumentPipelines(sdk)
  );
};
