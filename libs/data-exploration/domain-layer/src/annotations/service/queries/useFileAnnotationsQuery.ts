import { useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getAnnotations } from '../network';

export const useFileAnnotationsQuery = (fileId?: IdEither) => {
  const sdk = useSDK();

  return useQuery(queryKeys.fileAnnotations(fileId), () => {
    if (!fileId) {
      return [];
    }
    return getAnnotations(sdk, {
      annotatedResourceType: 'file',
      annotatedResourceIds: [fileId],
    });
  });
};
