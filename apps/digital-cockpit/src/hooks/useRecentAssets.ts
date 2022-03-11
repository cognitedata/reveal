import { Asset } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const RECENT_ASSETS_KEY = 'csp.recentAssets';

export type RecentAsset = {
  asset: Asset;
  dateAdded: number;
};

export const useRecentAssets = (): [RecentAsset[], (asset: Asset) => void] => {
  const { client } = useCDFExplorerContext();
  const recents = getRecents();
  const recentAssets = recents[client.project] || [];

  return [
    recentAssets,
    (asset: Asset) => {
      addToRecentAssets(client.project, asset);
    },
  ];
};

export const getRecents = (): { [key: string]: RecentAsset[] } => {
  const recents = localStorage.getItem(RECENT_ASSETS_KEY);
  return recents ? JSON.parse(recents) : {};
};

export const addToRecentAssets = (project: string, asset: Asset) => {
  const recents = getRecents();
  let recentAssets = recents[project];
  if (!recentAssets) {
    recentAssets = [{ asset, dateAdded: Date.now() }];
  }

  const index = recentAssets.findIndex((a) => a.asset.id === asset.id);
  if (index > -1) {
    recentAssets.splice(index, 1);
  }
  recentAssets.unshift({ asset, dateAdded: Date.now() });

  localStorage.setItem(
    RECENT_ASSETS_KEY,
    JSON.stringify({ ...recents, [project]: recentAssets })
  );
};
