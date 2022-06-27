import { useQuery } from 'react-query';

import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';

export const useDocumentByLabelExternalId = (
  labelExternalId: string | undefined
) => {
  return useQuery(
    ['documents', labelExternalId],
    () => {
      return getCogniteSDKClient()
        .documents.list({
          filter: {
            containsAll: {
              property: ['labels'],
              values: [
                {
                  externalId: labelExternalId || '',
                },
              ],
            },
          },
        })
        .then((res) => res.items);
    },
    {
      enabled: !!labelExternalId,
    }
  );
};
