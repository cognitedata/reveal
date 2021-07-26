import { getProject } from 'hooks';
import { useQuery } from 'react-query';

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
  assetId: number,
  timeseriesId: number
) => {
  const rvTS = localStorage.getItem('rv-assets') ?? '{}';
  const rvDictionary = JSON.parse(rvTS);
  const projectName = getProject();

  if (rvDictionary) {
    rvDictionary[projectName] = addRecentView(
      rvDictionary[projectName] ?? [],
      assetId
    );
    localStorage.setItem('rv-assets', JSON.stringify(rvDictionary));
  }
  addTSToRecentLocalStorage(timeseriesId);
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

export function useRecentViewLocalStorage<T>(
  viewType: string,
  defaultValue: T
) {
  const queryKey = `rv-${viewType}`;

  return useQuery<T>(
    queryKey,
    () => {
      return getRvFromLocal(viewType) ?? defaultValue;
    },
    {
      initialData: () => getRvFromLocal(viewType) ?? defaultValue,
    }
  );
}
