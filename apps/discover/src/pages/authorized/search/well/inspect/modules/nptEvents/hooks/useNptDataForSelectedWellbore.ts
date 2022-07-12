import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';
import { useNptEventsQuery } from 'domain/wells/npt/internal/queries/useNptEventsQuery';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';

import { useDeepMemo } from 'hooks/useDeep';

import { adaptNptDataToView } from '../utils/adaptNptDataToView';

export const useNptDataForSelectedWellbore = (selectedWellboreId?: string) => {
  const wellbores = useWellInspectSelectedWellbores();
  const { data = [], isLoading } = useNptEventsQuery({
    wellboreIds: selectedWellboreId ? [selectedWellboreId] : [],
  });
  const { nptCodeDefinitions } = useNptDefinitions();

  const adaptedNptData = useDeepMemo(() => {
    return adaptNptDataToView(wellbores, data);
  }, [wellbores, data]);

  return {
    isLoading,
    data: adaptedNptData,
    nptCodeDefinitions,
  };
};
