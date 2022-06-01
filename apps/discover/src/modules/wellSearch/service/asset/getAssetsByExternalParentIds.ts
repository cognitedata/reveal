import chunk from 'lodash/chunk';
import { log } from 'utils/log';

import { Asset } from '@cognite/sdk';

import { showErrorMessage } from '../../../../components/Toast';

export async function getAssetsByExternalParentIds(
  externalParentIds: string[],
  fetcher: any
) {
  if (fetcher) {
    const idChunkList = chunk(externalParentIds, 100);
    const responses = Promise.all(
      idChunkList.map((idChunk: string[]) =>
        fetcher({
          parentExternalIds: idChunk,
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
