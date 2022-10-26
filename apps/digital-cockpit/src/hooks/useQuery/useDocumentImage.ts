import { Buffer } from 'buffer';

import { FileInfo } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';
import { useQuery } from '@tanstack/react-query';

export const useDocumentImage = (document: FileInfo | undefined) => {
  const { client } = useCDFExplorerContext();

  return useQuery<any>(
    ['getFileImage', document?.id],
    () =>
      client
        .get(
          `/api/playground/projects/${client.project}/documents/preview?documentId=${document?.id}`,
          { headers: { Accept: 'image/png' }, responseType: 'arraybuffer' }
        )
        .then((response) => {
          return `data:image/png;base64,${Buffer.from(response.data).toString(
            'base64'
          )}`;
        }),
    {
      enabled:
        Boolean(document?.id) &&
        !document?.mimeType?.toLowerCase().includes('svg'), // svg is currently not supported
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
};
