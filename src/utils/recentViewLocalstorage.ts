import { Asset, Timeseries } from '@cognite/sdk';

const maxRecentViewLength = 10;

const addRecentView = (array: number[], source: number): number[] => {
  let viewArray = array;

  // Remove id from array if duplicate
  if (array.includes(source)) {
    viewArray = array.filter((x) => x !== source);
  }

  viewArray.unshift(source); // add to front

  if (viewArray && viewArray.length > maxRecentViewLength) {
    viewArray.splice(maxRecentViewLength, 1);
  }

  return viewArray;
};

export const addAssetToRecentLocalStorage = (
  asset: Asset,
  timeseriesId: number
) => {
  const rvAssets = localStorage.getItem('rv-assets') ?? '[]';

  if (rvAssets) {
    const newRvAssets = addRecentView(JSON.parse(rvAssets), asset.id);
    localStorage.setItem('rv-assets', JSON.stringify(newRvAssets));
  }
  addTSToRecentLocalStorage(timeseriesId);
};

export const addTSToRecentLocalStorage = (timeseriesId: number) => {
  const rvTS = localStorage.getItem('rv-timeseries') ?? '[]';

  if (rvTS) {
    const newRvTs = addRecentView(JSON.parse(rvTS), timeseriesId);
    localStorage.setItem('rv-timeseries', JSON.stringify(newRvTs));
  }
  window.dispatchEvent(new Event('storage')); // dispatch event to notify changes in RecentView
};

export const orderViewArray = (
  viewArray: (Asset | Timeseries)[],
  order: number[]
): (Asset | Timeseries)[] => {
  viewArray.sort((a, b) => {
    const A = a.id;
    const B = b.id;

    if (order.indexOf(A) > order.indexOf(B)) {
      return 1;
    }
    return -1;
  });
  return viewArray;
};

export const removeRecentViewFromLocal = (viewType: string) => {
  localStorage.removeItem(`rv-${viewType}`);
  window.dispatchEvent(new Event('storage')); // dispatch event to notify changes in RecentView
};
