import { useQuery } from 'react-query';

import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';

export const useDocumentPreviewLink = (documentId: number | undefined) => {
  return useQuery(
    ['document', 'previewLink', documentId],
    () => {
      return getCogniteSDKClient()
        .documents.preview.pdfTemporaryLink(documentId || 0)
        .then((res) => res.temporaryLink);
    },
    {
      cacheTime: 0,
      enabled: !!documentId,
    }
  );
};
