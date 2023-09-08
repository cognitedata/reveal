import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

import { SteamLitAppSpecNoContent } from '../pages/StreamLit/types';

const getApps = async () => {
  const files = await sdk.files
    .list({ filter: { directoryPrefix: '/streamlit-apps' } })
    .autoPagingToArray({ limit: 1000 });
  const apps: SteamLitAppSpecNoContent[] = files.map((file) => ({
    name: file.metadata?.name || '',
    description: file.metadata?.description || '',
    fileExternalId: file.externalId || '',
    creator: file.metadata?.creator || '',
    createdAt: file.createdTime,
    published: file.metadata?.published === 'true' ? true : false,
  }));

  return apps;
};

export const useApps = () => useQuery(['get-apps'], getApps);
