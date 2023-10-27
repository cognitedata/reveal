import { FileInfo, IdEither } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

export const useFileByIdsQuery = (ids?: (IdEither | null)[]) => {
  const idsNotNull = ids?.filter((id): id is IdEither => id !== null);

  return useCdfItems<FileInfo>('files', idsNotNull || [], false, {
    enabled: idsNotNull !== undefined,
  });
};
