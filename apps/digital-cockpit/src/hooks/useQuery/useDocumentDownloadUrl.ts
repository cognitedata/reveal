import { FileInfo } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';
import { useContext } from 'react';
import { useQuery } from 'react-query';

export const useDocumentDownloadUrl = (document: FileInfo) => {
  const { client } = useContext(CogniteSDKContext);

  return useQuery<any>(['getFileDownloadUrl', document.id], async () => {
    const downloadUrls = await client.files.getDownloadUrls([
      { id: document.id },
    ]);
    return downloadUrls[0].downloadUrl;
  });
};
