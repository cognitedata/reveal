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
  timeseriesId: number,
  projectName: string
) => {
  const rvTS = localStorage.getItem('rv-assets') ?? '{}';
  const rvDictionary = JSON.parse(rvTS);

  if (rvDictionary) {
    rvDictionary[projectName] = addRecentView(
      rvDictionary[projectName] ?? [],
      asset.id
    );
    localStorage.setItem('rv-assets', JSON.stringify(rvDictionary));
  }
  addTSToRecentLocalStorage(timeseriesId, projectName);

  window.dispatchEvent(new Event('storage')); // dispatch event to notify changes in RecentView
};

export const addTSToRecentLocalStorage = (
  timeseriesId: number,
  projectName: string
) => {
  const rvTS = localStorage.getItem('rv-timeseries') ?? '{}';
  const rvDictionary = JSON.parse(rvTS);

  if (rvDictionary) {
    rvDictionary[projectName] = addRecentView(
      rvDictionary[projectName] ?? [],
      timeseriesId
    );
    localStorage.setItem('rv-timeseries', JSON.stringify(rvDictionary));
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

export const getRvFromLocal = (viewType: string, projectName: string) => {
  const rvSources = localStorage.getItem(`rv-${viewType}`);
  const parsedSources = rvSources ? JSON.parse(rvSources ?? '{}') : null;

  const rvDictionary =
    !!parsedSources && projectName in parsedSources
      ? parsedSources[projectName]
      : null;
  return rvDictionary;
};
