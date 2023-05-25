import { CogniteClient, IdEither } from '@cognite/sdk';
import chunk from 'lodash/chunk';
import { MAX_RESULT_LIMIT_ASSET } from '../../../constants';

export const getEventsByIds = (sdk: CogniteClient, ids: IdEither[]) => {
  const chunkedEventIds = chunk(ids, MAX_RESULT_LIMIT_ASSET);
  const chunkedPromises = chunkedEventIds.map((eventIds) =>
    sdk.events.retrieve(eventIds, { ignoreUnknownIds: true })
  );
  return Promise.all(chunkedPromises).then((result) => result.flat());
};
