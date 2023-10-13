/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult, useQuery, type QueryFunction } from '@tanstack/react-query';
import { type CogniteClient, type FileFilterProps } from '@cognite/sdk';

export const use360ImagesFileIds = (
  siteIds: string[],
  sdk: CogniteClient
): UseQueryResult<number[] | undefined, unknown> => {
  const queryFunction: QueryFunction<number[] | undefined> = async () => {
    const fileIdListPromises = await Promise.allSettled(
      siteIds.map(async (siteId) => {
        const req = {
          metadata: { site_id: siteId }
        };
        const fileIds = await listFileIds(req as FileFilterProps, sdk);
        return fileIds;
      })
    );

    const fileIdList: number[] = [];
    fileIdListPromises.forEach((fileIdListPromise) => {
      if (fileIdListPromise.status === 'fulfilled') {
        fileIdListPromise.value.forEach((fileId) => fileIdList.push(fileId));
      } else if (fileIdListPromise.status === 'rejected') {
        console.error('Error while retriving File Ids', fileIdListPromise.reason);
      }
    });

    return fileIdList;
  };

  const queryResult = useQuery<number[] | undefined>(['cdf', 'files', siteIds], queryFunction, {
    staleTime: Infinity
  });

  return queryResult;
};

const listFileIds = async (filter: FileFilterProps, sdk: CogniteClient): Promise<number[]> => {
  const req = { filter, limit: 1000 };
  const map = await sdk.files.list(req).autoPagingToArray({ limit: Infinity });

  const fileInfo = await Promise.all(map.flat());
  const list = fileInfo.map((file) => file.id);

  return list;
};
