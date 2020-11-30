import { useEffect } from 'react';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';

import { fetchAllCharts } from 'reducers/charts/api';

export default (): boolean => {
  const dispatch = useDispatch();
  const firebaseReady = useSelector((state) => state.environment.firebaseReady);
  const chartsInitialized = useSelector((state) => state.charts.initialized);

  useEffect(() => {
    if (firebaseReady) {
      dispatch(fetchAllCharts());
    }
  }, [firebaseReady]);

  return chartsInitialized;
};
