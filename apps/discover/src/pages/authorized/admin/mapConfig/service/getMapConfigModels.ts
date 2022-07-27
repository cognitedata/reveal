import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

import { MODEL_ID_GENERAL, SPACE_ID } from './constants';

export const getMapConfigModels = async () => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  const response = await clientCogniteFDM.get.models({
    client: clientCognite,
    spaceExternalId: SPACE_ID,
    items: [{ externalId: MODEL_ID_GENERAL }],
  });

  if ('data' in response) {
    return response.data.items;
  }

  return [];
};
