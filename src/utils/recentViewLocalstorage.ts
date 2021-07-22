import { Asset } from '@cognite/sdk'; // dispatch event to notify changes in RecentView

import { getProject } from 'hooks';

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
  const rvTS = localStorage.getItem('rv-assets') ?? '{}';
  const rvDictionary = JSON.parse(rvTS);
  const projectName = getProject();

  if (rvDictionary) {
    rvDictionary[projectName] = addRecentView(
      rvDictionary[projectName] ?? [],
      asset.id
    );
    localStorage.setItem('rv-assets', JSON.stringify(rvDictionary));
  }
  addTSToRecentLocalStorage(timeseriesId);
  window.dispatchEvent(new Event('storage')); // dispatch event to notify changes in RecentView
};

export const addTSToRecentLocalStorage = (timeseriesId: number) => {
  const rvTS = localStorage.getItem('rv-timeseries') ?? '{}';
  const rvDictionary = JSON.parse(rvTS);
  const projectName = getProject();

  if (rvDictionary) {
    rvDictionary[projectName] = addRecentView(
      rvDictionary[projectName] ?? [],
      timeseriesId
    );
    localStorage.setItem('rv-timeseries', JSON.stringify(rvDictionary));
  }
  window.dispatchEvent(new Event('storage')); // dispatch event to notify changes in RecentView
};

export const getRvFromLocal = (viewType: string) => {
  const projectName = getProject();
  const rvSources = localStorage.getItem(`rv-${viewType}`);
  const parsedSources = rvSources ? JSON.parse(rvSources ?? '{}') : null;

  const rvDictionary =
    !!parsedSources && projectName in parsedSources
      ? parsedSources[projectName]
      : null;
  return rvDictionary;
};
