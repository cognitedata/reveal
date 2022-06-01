import { normalize } from 'domain/wells/well/internal/transformers/normalize';

import { getWellSDKClient } from 'services/wellSearch/sdk';

import { WellItems, Well } from '@cognite/sdk-wells-v3';

import { toIdentifier, toIdentifierItems } from 'modules/wellSearch/sdk/utils';

export function getWellsByIds(ids: Well['matchingId'][]) {
  const client = getWellSDKClient();

  return (
    client.wells.retrieveMultiple(
      toIdentifierItems(ids.map((id) => toIdentifier(id)))
    ) as Promise<WellItems>
  ).then((response) => {
    return response.items.map(normalize);
  });
}
