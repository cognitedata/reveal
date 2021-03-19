/*
 this will bring whether provided metadata field is being saved to cdf.
 Can be used to show loading icon
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

const useIsFieldSavePending = (id: string) => {
  const [loading, setLoadingState] = useState<boolean>(false);
  const loadingField = useSelector(
    ({ previewSlice }: RootState) => previewSlice.loadingField
  );

  useEffect(() => {
    if (loadingField === id) {
      setLoadingState(true);
    }
    if (loadingField === null) {
      setLoadingState(false);
    }
  }, [loadingField]);

  return loading;
};

export default useIsFieldSavePending;
