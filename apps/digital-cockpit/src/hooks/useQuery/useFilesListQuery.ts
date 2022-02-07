import { useContext } from 'react';
import { useQuery } from 'react-query';
import { FileInfo, FileRequestFilter } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useFilesListQuery = (fileListQuery?: FileRequestFilter) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<FileInfo[]>(
    ['filesList', fileListQuery],
    () => client.files.list(fileListQuery).then((res) => res.items),
    {
      enabled: Boolean(fileListQuery),
    }
  );
  return query;
};

export default useFilesListQuery;
