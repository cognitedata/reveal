import { useEffect } from 'react';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';

import { fetchAllCharts } from 'reducers/charts/api';
import { fetchAllCollections } from 'reducers/collections/api';

export default (): boolean => {
  const dispatch = useDispatch();
  const firebaseReady = useSelector((state) => state.environment.firebaseReady);
  const chartsInitialized = useSelector((state) => state.charts.initialized);
  const collectionsInitialized = useSelector(
    (state) => state.collections.initialized
  );

  useEffect(() => {
    if (firebaseReady) {
      dispatch(fetchAllCharts());
      dispatch(fetchAllCollections());
    }
  }, [firebaseReady]);

  return chartsInitialized && collectionsInitialized;
};
