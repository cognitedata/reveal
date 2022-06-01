import { log } from 'utils/log';

import { Asset } from '@cognite/sdk';

import { showErrorMessage } from '../../../../components/Toast';
import { getChunkNumberList } from '../sequence/common';

/**
 *  @deprecated this is only for v2 and only for digital rocks asset lookups
 */
export async function getAssetsByParentIds(parentIds: number[], fetcher: any) {
  if (fetcher) {
    const idChunkList = getChunkNumberList(parentIds, 100);
    const responses = Promise.all(
      idChunkList.map((idChunk: number[]) =>
        fetcher({
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
  showErrorMessage('Digital Rocks not configured');
  return Promise.resolve([] as Asset[]);
}
