import { useQuery } from 'react-query';
import { FileInfo, FilesSearchFilter } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useFileSearchQuery = (fileSearchQuery?: FilesSearchFilter) => {
  const { client } = useCDFExplorerContext();

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
