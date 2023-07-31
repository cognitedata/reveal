import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

import { MODEL_ID_GENERAL, SPACE_ID } from './constants';

export const SCHEMA_GENERAL = {
  externalId: MODEL_ID_GENERAL,
  properties: {
    zoom: {
      type: 'int',
      nullable: false,
    },
    cluster: {
      type: 'boolean',
      nullable: false,
    },
    minimap: {
      type: 'boolean',
      nullable: false,
    },
    center: {
      type: 'text',
      nullable: false,
    },
  },
};

export const createMapConfigModels = async () => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  return clientCogniteFDM.create.models({
    client: clientCognite,
    spaceExternalId: SPACE_ID,
    items: [SCHEMA_GENERAL],
  });
};
