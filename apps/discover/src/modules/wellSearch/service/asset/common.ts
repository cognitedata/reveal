import { Asset } from '@cognite/sdk';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { log } from '_helpers/log';

import { getChunkNumberList } from '../sequence/common';

export async function getAssetsByParentIds(parentIds: number[], fetcher: any) {
  if (fetcher) {
    const idChunkList = getChunkNumberList(parentIds, 100);
    const responses = Promise.all(
      idChunkList.map((idChunk: number[]) =>
        fetcher(getCogniteSDKClient(), {
          parentIds: idChunk,
        })
      )
    );
    return [].concat(
      ...(await responses).map((response) =>
        response.items ? response.items : response
      )
    );
  }
  log('fetcher configurations not found while fetching assets by wellbore id');
  return Promise.resolve([] as Asset[]);
}
