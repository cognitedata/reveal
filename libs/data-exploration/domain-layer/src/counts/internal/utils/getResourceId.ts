import { IdEither } from '@cognite/sdk';

import { BaseResource } from '../types';

export const getResourceId = (
  resource?: BaseResource
): IdEither | undefined => {
  if (!resource) {
    return undefined;
  }

  const { id, externalId } = resource;

  if (externalId) {
    return {
      externalId,
    };
  }

  return { id };
};
