import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  list as listAllDatasets,
  selectAllDataSets,
  dataSetCounts,
  datasetsFetched,
} from 'modules/datasets';

export const useDatasets = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dataSetResourceCounts = useSelector(dataSetCounts);
  const datasets = useSelector(selectAllDataSets);
  const isLoaded = useSelector(datasetsFetched);

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      dispatch(listAllDatasets({}));
      setIsLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isLoading]);

  useEffect(() => {
    if (isLoaded && isLoading) setIsLoading(false);
  }, [isLoaded, isLoading]);

  return {
    datasets,
    dataSetResourceCounts,
    isLoaded,
  };
};
