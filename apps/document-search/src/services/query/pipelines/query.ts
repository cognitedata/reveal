import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { fetchDocumentPipelines } from '../../api';
import { PIPELINES_KEYS } from '../../constants';

export const useDocumentsPipelinesQuery = () => {
  const sdk = useSDK();

  return useQuery(PIPELINES_KEYS.pipelines(), () =>
    fetchDocumentPipelines(sdk)
  );
};
