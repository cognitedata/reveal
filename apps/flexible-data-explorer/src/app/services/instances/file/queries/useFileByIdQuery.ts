import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { isNumeric } from '../../../../utils/number';

const getFileId = (id: string | number) => {
  if (typeof id === 'number' || isNumeric(id)) {
    return { id: Number(id) };
  }

  return { externalId: id };
};

export const useFileByIdQuery = (id?: string | number) => {
  return useCdfItem<FileInfo>('files', getFileId(id!), {
    enabled: id !== undefined,
  });
};
