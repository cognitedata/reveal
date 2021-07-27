import { getProject } from 'hooks';
import { QueryClient, useQuery, useQueryClient } from 'react-query';

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

export const addAssetToRecentLocalStorage = async (
  assetId: number,
  timeseriesId: number,
  cached: QueryClient
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
  addTSToRecentLocalStorage(timeseriesId, cached);
  await cached.invalidateQueries(['rv-assets']);
};

const addTSToRecentLocalStorage = async (
  timeseriesId: number,
  cached: QueryClient
) => {
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
  await cached.invalidateQueries(['rv-timeseries']);
};

const getRvFromLocal = (viewType: string) => {
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

export const useAddToRecentLocalStorage = () => {
  const cached = useQueryClient();
  return {
    addAssetToRecent: (assetId: number, timeseriesId: number) =>
      addAssetToRecentLocalStorage(assetId, timeseriesId, cached),
    addTsToRecent: (timeseriesId: number) =>
      addTSToRecentLocalStorage(timeseriesId, cached),
  };
};
