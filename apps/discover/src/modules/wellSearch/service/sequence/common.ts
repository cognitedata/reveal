import { Sequence } from '@cognite/sdk';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { log } from '_helpers/log';

export interface SequenceFilter {
  exclude?: string;
  filter?: any;
}
export async function getSequenceByWellboreIds(
  wellboreIds: number[],
  options: SequenceFilter = {}
): Promise<Sequence[]> {
  // console.log('Searching with filter:', options.filter);

  const idChunkList = getChunkNumberList(wellboreIds, 100);
  const sequences = Promise.all(
    idChunkList.map((idChunk: number[]) =>
      getCogniteSDKClient()
        .sequences.list({
          filter: {
            assetIds: idChunk,
            ...options.filter,
          },
        })
        .then((list) => {
          if (options.exclude) {
            return list.items.filter((item) =>
              item.name!.startsWith(options.exclude as string)
            );
          }

          return list.items;
        })
    )
  );
  return ([] as Sequence[]).concat(...(await sequences));
}

export const getChunkNumberList = (list: number[], size: number) => {
  let i;
  let j;
  let temparray;
  const chunkList = [];
  for (i = 0, j = list.length; i < j; i += size) {
    temparray = list.slice(i, i + size);
    chunkList.push(temparray);
  }
  return chunkList;
};

export async function getSequencesByAssetIds(
  wellboreIds: number[],
  fetcher: any
) {
  if (fetcher) {
    const idChunkList = getChunkNumberList(wellboreIds, 100);
    const responses = Promise.all(
      idChunkList.map((idChunk: number[]) =>
        fetcher(getCogniteSDKClient(), {
          assetIds: idChunk,
        })
      )
    );
    return [].concat(
      ...(await responses).map((response) =>
        response.items ? response.items : response
      )
    );
  }
  log(
    'fetcher configurations not found while fetching sequences by wellbore id'
  );
  return Promise.resolve([]);
}

export function getSequenceRowData(id: number, limit = 10000) {
  return getCogniteSDKClient()
    .sequences.retrieveRows({
      id,
      start: 0,
      end: 1000,
      limit: 1000,
    })
    .autoPagingToArray({ limit })
    .catch((error) => {
      log('error', error);
      return [];
    });
}
