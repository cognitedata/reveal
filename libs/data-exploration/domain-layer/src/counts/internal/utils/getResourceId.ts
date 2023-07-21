import { IdEither } from '@cognite/sdk';

import { BaseResourceProps } from '../types';

export const getResourceId = (
  resource: BaseResourceProps
): IdEither | undefined => {
  if (!resource) {
    return undefined;
  }

  const { id, externalId } = resource;

  if (externalId) {
    return { externalId };
  }

  return { id };
};
