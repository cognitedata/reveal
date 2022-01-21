import { useContext } from 'react';
import { useQuery } from 'react-query';
import { FileInfo, FilesSearchFilter } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useFileSearchQuery = (fileSearchQuery?: FilesSearchFilter) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<FileInfo[]>(
    ['fileSearch', fileSearchQuery],
    () => client.files.search(fileSearchQuery || {}),
    {
      enabled: Boolean(fileSearchQuery),
    }
  );
  return query;
};

export default useFileSearchQuery;
