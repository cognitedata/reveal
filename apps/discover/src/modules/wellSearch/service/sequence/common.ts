import flatten from 'lodash/flatten';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { Sequence } from '@cognite/sdk';

import { showErrorMessage } from '../../../../components/toast';

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
    const responses = await Promise.all(
      idChunkList.map((idChunk: number[]) =>
        fetcher({
          assetIds: idChunk,
        })
      )
    );
    return flatten(responses);
  }
  log(
    'fetcher configurations not found while fetching sequences by wellbore id'
  );
  showErrorMessage('Digital Rocks not configured');
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
