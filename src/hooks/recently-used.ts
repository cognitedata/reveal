import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { useProject } from './config';

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

const addAssetToRecentLocalStorage = async (
  project: string,
  assetId: number,
  timeseriesId: number,
  cached: QueryClient
) => {
  const rvTS = localStorage.getItem('rv-assets') ?? '{}';
  const rvDictionary = JSON.parse(rvTS);

  if (rvDictionary) {
    rvDictionary[project] = addRecentView(rvDictionary[project] ?? [], assetId);
    localStorage.setItem('rv-assets', JSON.stringify(rvDictionary));
  }
  addTSToRecentLocalStorage(project, timeseriesId, cached);
  await cached.invalidateQueries(['rv-assets']);
};

const addTSToRecentLocalStorage = async (
  project: string,
  timeseriesId: number,
  cached: QueryClient
) => {
  const rvTS = localStorage.getItem('rv-timeseries') ?? '{}';
  const rvDictionary = JSON.parse(rvTS);

  if (rvDictionary) {
    rvDictionary[project] = addRecentView(
      rvDictionary[project] ?? [],
      timeseriesId
    );
    localStorage.setItem('rv-timeseries', JSON.stringify(rvDictionary));
  }
  await cached.invalidateQueries(['rv-timeseries']);
};

const getRvFromLocal = (project: string, viewType: string) => {
  const rvSources = localStorage.getItem(`rv-${viewType}`);
  const parsedSources = rvSources ? JSON.parse(rvSources ?? '{}') : null;

  const rvDictionary =
    !!parsedSources && project in parsedSources ? parsedSources[project] : null;
  return rvDictionary;
};

export function useRecentViewLocalStorage<T>(
  viewType: string,
  defaultValue: T
) {
  const queryKey = `rv-${viewType}`;
  const project = useProject();

  return useQuery<T>(
    queryKey,
    () => {
      return getRvFromLocal(project, viewType) ?? defaultValue;
    },
    {
      initialData: () => getRvFromLocal(project, viewType) ?? defaultValue,
    }
  );
}

export const useAddToRecentLocalStorage = () => {
  const cached = useQueryClient();
  const project = useProject();

  return {
    addAssetToRecent: (assetId: number, timeseriesId: number) =>
      addAssetToRecentLocalStorage(project, assetId, timeseriesId, cached),
    addTimeseriesToRecent: (timeseriesId: number) =>
      addTSToRecentLocalStorage(project, timeseriesId, cached),
  };
};
