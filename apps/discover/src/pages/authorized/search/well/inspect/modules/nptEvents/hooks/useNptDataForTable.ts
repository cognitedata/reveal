import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';
import { useNptEventsQuery } from 'domain/wells/npt/internal/queries/useNptEventsQuery';
import { useWellInspectSelectedWellboreNames } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreNames';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import { adaptNptDataToView } from '../utils/adaptNptDataToView';

export const useNptDataForTable = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreNames = useWellInspectSelectedWellboreNames();

  const { data: nptData = [], isLoading } = useNptEventsQuery({ wellboreIds });
  const { nptCodeDefinitions, nptDetailCodeDefinitions } = useNptDefinitions();

  const adaptedNptData = useDeepMemo(() => {
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
