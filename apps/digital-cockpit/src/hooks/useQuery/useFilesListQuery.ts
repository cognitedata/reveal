import { useQuery } from 'react-query';
import { FileInfo, FileRequestFilter } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useFilesListQuery = (fileListQuery?: FileRequestFilter) => {
  const { client } = useCDFExplorerContext();

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
