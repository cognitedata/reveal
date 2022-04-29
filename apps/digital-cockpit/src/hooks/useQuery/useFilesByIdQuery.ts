import { useQuery } from 'react-query';
import { FileInfo, IdEither } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useFilesByIdQuery = (ids?: IdEither[]) => {
  const { client } = useCDFExplorerContext();

  const query = useQuery<FileInfo[]>(
    ['filesByIdIds', ids],
    () => client.files.retrieve(ids as IdEither[]),
    {
      enabled: Boolean(ids),
    }
  );
  return query;
};

export default useFilesByIdQuery;
