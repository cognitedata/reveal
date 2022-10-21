import { AllCursorsProps } from 'domain/wells/types';

import { useMemo } from 'react';

import { EMPTY_OBJECT } from 'constants/empty';

import { useRigOperationsQuery } from '../queries/useRigOperationsQuery';
import { adaptToWellboreRigNamesMap } from '../transformers/adaptToWellboreRigNamesMap';
import { WellboreRigNamesMap } from '../types';

export const useWellboreRigNamesMap = ({ wellboreIds }: AllCursorsProps) => {
  const { data, isLoading } = useRigOperationsQuery({ wellboreIds });

  return useMemo(() => {
    if (!data || isLoading) {
      return {
        data: EMPTY_OBJECT as WellboreRigNamesMap,
        isLoading,
      };
    }

    return {
      data: adaptToWellboreRigNamesMap(data),
      isLoading,
    };
  }, [data, isLoading]);
};
