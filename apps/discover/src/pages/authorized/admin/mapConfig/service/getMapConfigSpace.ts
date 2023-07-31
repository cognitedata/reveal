import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

import { SPACE_ID } from './constants';

export const getMapConfigSpace = async () => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  const response = await clientCogniteFDM.get.spaces({
    client: clientCognite,
    items: [{ externalId: SPACE_ID }],
  });

  if ('data' in response) {
    return response.data.items;
  }

  return [];
};
