import { AllCursorsProps } from 'domain/wells/types';

import { useHoleSectionsQuery } from '../queries/useHoleSectionsQuery';

export const useHoleSectionsData = ({ wellboreIds }: AllCursorsProps) => {
  const { data: holeSectionsData, isLoading: isHoleSectionsLoading } =
    useHoleSectionsQuery({
      wellboreIds,
    });

  return {
    data: holeSectionsData,
    isLoading: isHoleSectionsLoading,
  };
};
