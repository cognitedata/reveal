import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export const useDataModelParams = () => {
  const { dataModel, space, version } = useParams();

  return useMemo(() => {
    if (dataModel && space && version) {
      return { dataModel, space, version };
    }

    return undefined;
  }, [dataModel, space, version]);
};
