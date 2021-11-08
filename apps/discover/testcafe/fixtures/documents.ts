import {
  authenticateDocumentSDK,
  getDocumentSDKClient,
} from '../../src/modules/documentSearch/sdk';
import App from '../__pages__/App';
import { getTokenHeaders, progress } from '../utils';

export const getOneDocument = async ({ name }: { name: string }) => {
  const headers = await getTokenHeaders({ access: true });

  await authenticateDocumentSDK(
    'discover-staging',
    `https://${App.cluster}.cognitedata.com`,
    App.project,
    headers.token
  );

  progress(`Fetching documents...`);
  const result = await getDocumentSDKClient().documents.search({
    limit: 1,
    search: {
      query: name,
      highlight: false,
    },
  });

  if (result.items.length > 0) {
    //   progress(`${result.items[0].item.id}`);
    return result.items[0].item;
  }

  progress(`Error fetching documents!`);
  return false;
};
