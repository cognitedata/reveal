import {
  authenticateWellSDK,
  getWellSDKClient,
} from '../../src/modules/wellSearch/sdk/v3';
import App from '../__pages__/App';
import { getTokenHeaders } from '../utils';

export const getOneWell = async () => {
  const headers = await getTokenHeaders({ access: true });

  await authenticateWellSDK(
    'discover-staging',
    `https://${App.cluster}.cognitedata.com`,
    App.project,
    headers.token
  );

  const client = await getWellSDKClient();

  const result = await client.wells.list({
    limit: 1,
  });

  return result.items[0];
};
