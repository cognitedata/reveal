import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';
import { useNptEventsQuery } from 'domain/wells/npt/internal/queries/useNptEventsQuery';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellboreNames } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreNames';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import { useMemo } from 'react';

import { adaptNptDataToView } from '../utils/adaptNptDataToView';

export const useNptData = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreNames = useWellInspectSelectedWellboreNames();

  const { nptCodeDefinitions, nptDetailCodeDefinitions } = useNptDefinitions();

  const { data: nptData = [], isLoading } = useNptEventsQuery({ wellboreIds });

  const adaptedNptData = useMemo(() => {
    return adaptNptDataToView(wellbores, nptData);
  }, [wellbores, nptData]);

  return {
    isLoading,
    data: adaptedNptData,
    wellboreNames,
    nptCodeDefinitions,
    nptDetailCodeDefinitions,
  };
};
