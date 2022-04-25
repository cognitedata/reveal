import { Well, WellItems } from '@cognite/sdk-wells-v3';

import { toIdentifier, toIdentifierItems } from '../utils/toIdentifier';

import { getWellSDKClient } from './authenticate';

export const getWellByMatchingId = async (id: Well['matchingId']) => {
  const client = getWellSDKClient();
  return (
    client.wells.retrieveMultiple(
      toIdentifierItems([toIdentifier(id)])
    ) as Promise<WellItems>
  ).then((response) => {
    return response.items[0];
  });
};
