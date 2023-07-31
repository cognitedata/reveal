import { AllCursorsProps } from 'domain/wells/types';

import { useMemo } from 'react';

import { useTrajectoriesDataQuery } from '../queries/useTrajectoriesDataQuery';
import { useTrajectoriesQuery } from '../queries/useTrajectoriesQuery';
import { mergeTrajectoriesAndData } from '../transformers/mergeTrajectoriesAndData';

export const useTrajectoriesWithData = ({ wellboreIds }: AllCursorsProps) => {
  const { data: trajectories = [], isLoading: isTrajectoriesLoading } =
    useTrajectoriesQuery({ wellboreIds });

  const sequenceExternalIds = useMemo(
    () => trajectories.map(({ source }) => source.sequenceExternalId),
    [trajectories]
  );

  const { data: trajectoriesData = [], isLoading: isTrajectoriesDataLoading } =
    useTrajectoriesDataQuery({
      sequenceExternalIds,
    });

  const trajectoriesWithData = useMemo(
    () => mergeTrajectoriesAndData(trajectories, trajectoriesData),
    [trajectories, trajectoriesData]
  );

  return {
    data: trajectoriesWithData,
    isLoading: isTrajectoriesLoading || isTrajectoriesDataLoading,
  };
};
