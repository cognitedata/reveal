import { Asset } from '@cognite/sdk';

const maxRecentViewLength = 10;

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
  console.log('adding');
  const rvTS = localStorage.getItem('rv-timeseries') ?? '[]';

  if (rvTS) {
    console.log('timeseries');
    const newRvTs = addRecentView(JSON.parse(rvTS), timeseriesId);
    localStorage.setItem('rv-timeseries', JSON.stringify(newRvTs));
  }
};

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
