import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

import { SPACE_ID } from './constants';

export const createMapConfigSpace = async () => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  return clientCogniteFDM.create.space({
    client: clientCognite,
    items: [{ externalId: SPACE_ID }],
  });
};
