import { FileInfo } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';
import { useQuery } from 'react-query';

export const useDocumentDownloadUrl = (document: FileInfo) => {
  const { client } = useCDFExplorerContext();

  return useQuery<any>(['getFileDownloadUrl', document.id], async () => {
    const downloadUrls = await client.files.getDownloadUrls([
      { id: document.id },
    ]);
    return downloadUrls[0].downloadUrl;
  });
};
