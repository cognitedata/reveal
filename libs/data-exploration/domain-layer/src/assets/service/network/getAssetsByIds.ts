import chunk from 'lodash/chunk';

import { CogniteClient, IdEither } from '@cognite/sdk';

import { MAX_RESULT_LIMIT_ASSET } from '../../../constants';

export const getAssetsByIds = (sdk: CogniteClient, ids: IdEither[]) => {
  const chunkedAssetIds = chunk(ids, MAX_RESULT_LIMIT_ASSET);
  const chunkedPromises = chunkedAssetIds.map((assetIds) =>
    sdk.assets.retrieve(assetIds, { ignoreUnknownIds: true })
  );
  return Promise.all(chunkedPromises).then((result) => result.flat());
};
