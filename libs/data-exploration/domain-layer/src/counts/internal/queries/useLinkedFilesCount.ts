import { IdEither } from '@cognite/sdk';

import { useLinkedDocumentsCountQuery } from '../../service';

export const useLinkedFilesCount = (resourceId?: IdEither) => {
  const { data = 0, isLoading } = useLinkedDocumentsCountQuery(resourceId);

  return { data, isLoading };
};
